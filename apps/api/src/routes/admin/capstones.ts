/**
 * Admin: Capstone projects (and their people, materials, photos).
 * Each capstone has 1:N children across `capstone_people`, `capstone_materials`,
 * and `capstone_photos`. Updates replace child collections wholesale, then
 * delete any photo objects from R2 that the new state no longer references.
 */
import { Hono } from "hono"
import { z } from "zod"

import { cdnUrl } from "../../lib/cdn"
import type { Db } from "../../lib/db"
import { requireAuth } from "../../lib/middleware"
import { deleteObjects } from "../../lib/r2"
import { slugify } from "../../lib/slug"
import type { AppEnv } from "../../types"

const MAX_PER_LEVEL = 50
const MAX_PHOTOS = 6
const MAX_MATERIALS = 30

// ---------- Schemas ----------

const personSchema = z.object({
  name_en: z.string().trim().min(1),
  name_ar: z.string().trim().min(1),
})

const materialSchema = z.object({
  name_en: z.string().trim().min(1),
  name_ar: z.string().trim().min(1),
  photo_key: z.string().trim().min(1).nullable().optional(),
})

const sectionsBase = {
  abstract_en: z.string().trim().min(1),
  abstract_ar: z.string().trim().min(1),
  introduction_en: z.string().trim().min(1),
  introduction_ar: z.string().trim().min(1),
  methodology_en: z.string().trim().min(1),
  methodology_ar: z.string().trim().min(1),
  analysis_en: z.string().trim().min(1),
  analysis_ar: z.string().trim().min(1),
  conclusion_en: z.string().trim().min(1),
  conclusion_ar: z.string().trim().min(1),
  recommendations_en: z.string().trim().min(1),
  recommendations_ar: z.string().trim().min(1),
}

const createSchema = z.object({
  title_en: z.string().trim().min(1),
  title_ar: z.string().trim().min(1),
  full_name_en: z.string().trim().min(1),
  full_name_ar: z.string().trim().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  semester: z.enum(["first", "second"]),
  ...sectionsBase,
  card_photo_key: z.string().trim().min(1).nullable().optional(),
  producers_photo_key: z.string().trim().min(1).nullable().optional(),
  poster_link: z.string().trim().url().nullable().optional(),
  portfolio_link: z.string().trim().url().nullable().optional(),
  presentation_link: z.string().trim().url().nullable().optional(),
  students: z.array(personSchema).default([]),
  supervisors: z.array(personSchema).default([]),
  materials: z.array(materialSchema).max(MAX_MATERIALS).default([]),
  photo_keys: z.array(z.string().min(1)).max(MAX_PHOTOS).default([]),
})

const updateSchema = createSchema.partial()
const idSchema = z.coerce.number().int().positive()

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  level: z.coerce.number().int().min(1).max(3).optional(),
  sort: z
    .enum(["dateNewest", "dateOldest", "nameAsc", "nameDesc"])
    .default("dateNewest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

// ---------- Helpers ----------

type PersonInput = z.infer<typeof personSchema>
type MaterialInput = z.infer<typeof materialSchema>

// Slug uniqueness is best-effort: we just append a numeric suffix until the
// candidate is free. With real-world usage that loop terminates in a couple of
// iterations; collisions are vanishingly rare.
async function uniqueSlug(db: Db, from: string): Promise<string> {
  const base = slugify(from)
  let candidate = base
  let n = 1
  while (true) {
    const hit = await db
      .selectFrom("capstones")
      .select("id")
      .where("slug", "=", candidate)
      .executeTakeFirst()
    if (!hit) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

// Replace people of a given role wholesale. Used by both POST and PATCH.
async function replacePeople(
  db: Db,
  capstoneId: number,
  role: "student" | "supervisor",
  people: PersonInput[],
  now: string,
) {
  await db
    .deleteFrom("capstone_people")
    .where("capstone_id", "=", capstoneId)
    .where("role", "=", role)
    .execute()
  if (people.length === 0) return
  await db
    .insertInto("capstone_people")
    .values(
      people.map((p, idx) => ({
        capstone_id: capstoneId,
        role,
        name_en: p.name_en,
        name_ar: p.name_ar,
        position: idx,
        created_at: now,
      })),
    )
    .execute()
}

// Replace materials wholesale; returns photo keys removed by this replacement
// (new state doesn't reference them) so the caller can delete them from R2.
async function replaceMaterials(
  db: Db,
  capstoneId: number,
  materials: MaterialInput[],
  now: string,
): Promise<string[]> {
  const oldRows = await db
    .selectFrom("capstone_materials")
    .select("photo_key")
    .where("capstone_id", "=", capstoneId)
    .execute()

  await db
    .deleteFrom("capstone_materials")
    .where("capstone_id", "=", capstoneId)
    .execute()

  if (materials.length > 0) {
    await db
      .insertInto("capstone_materials")
      .values(
        materials.map((m, idx) => ({
          capstone_id: capstoneId,
          name_en: m.name_en,
          name_ar: m.name_ar,
          photo_key: m.photo_key ?? null,
          position: idx,
          created_at: now,
        })),
      )
      .execute()
  }

  const kept = new Set(
    materials.map((m) => m.photo_key).filter((k): k is string => Boolean(k)),
  )
  return oldRows
    .map((r) => r.photo_key)
    .filter((k): k is string => !!k && !kept.has(k))
}

// Replace gallery photos wholesale; returns keys removed for R2 cleanup.
async function replacePhotos(
  db: Db,
  capstoneId: number,
  photoKeys: string[],
  now: string,
): Promise<string[]> {
  const oldRows = await db
    .selectFrom("capstone_photos")
    .select("photo_key")
    .where("capstone_id", "=", capstoneId)
    .execute()

  await db
    .deleteFrom("capstone_photos")
    .where("capstone_id", "=", capstoneId)
    .execute()

  if (photoKeys.length > 0) {
    await db
      .insertInto("capstone_photos")
      .values(
        photoKeys.map((key, idx) => ({
          capstone_id: capstoneId,
          photo_key: key,
          position: idx,
          created_at: now,
        })),
      )
      .execute()
  }

  const kept = new Set(photoKeys)
  return oldRows.map((r) => r.photo_key).filter((k) => !kept.has(k))
}

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

// ---------- List ----------

app.get("/", async (c) => {
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(new URL(c.req.url).searchParams),
  )
  if (!parsed.success) {
    return c.json(
      { error: "Invalid query", issues: parsed.error.issues },
      400,
    )
  }
  const { q, level, sort, page, limit } = parsed.data
  const db = c.get("db")

  let baseQuery = db
    .selectFrom("capstones")
    .innerJoin("user", "user.id", "capstones.author_id")
  if (q) {
    const like = `%${q}%`
    baseQuery = baseQuery.where((eb) =>
      eb.or([eb("title_en", "like", like), eb("title_ar", "like", like)]),
    )
  }
  if (level) {
    baseQuery = baseQuery.where("capstones.level", "=", level)
  }

  const totalRow = await baseQuery
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  const total = Number(totalRow.count)

  let rowsQuery = baseQuery.select([
    "capstones.id",
    "capstones.slug",
    "capstones.title_en",
    "capstones.title_ar",
    "capstones.level",
    "capstones.semester",
    "capstones.card_photo_key",
    "capstones.created_at",
    "user.name as author_name",
  ])
  switch (sort) {
    case "dateNewest":
      rowsQuery = rowsQuery.orderBy("capstones.created_at", "desc")
      break
    case "dateOldest":
      rowsQuery = rowsQuery.orderBy("capstones.created_at", "asc")
      break
    case "nameAsc":
      rowsQuery = rowsQuery.orderBy("capstones.title_en", "asc")
      break
    case "nameDesc":
      rowsQuery = rowsQuery.orderBy("capstones.title_en", "desc")
      break
  }

  const rows = await rowsQuery
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  return c.json({ data: rows, meta: { total, page, limit } })
})

// ---------- Detail (with all child collections) ----------

app.get("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)

  const db = c.get("db")
  const cdn = c.env.CDN_BASE

  const row = await db
    .selectFrom("capstones")
    .selectAll()
    .where("id", "=", parsed.data)
    .executeTakeFirst()
  if (!row) return c.json({ error: "Not found" }, 404)

  const [people, materials, photos] = await Promise.all([
    db
      .selectFrom("capstone_people")
      .select(["id", "role", "name_en", "name_ar", "position"])
      .where("capstone_id", "=", row.id)
      .orderBy("role", "asc")
      .orderBy("position", "asc")
      .execute(),
    db
      .selectFrom("capstone_materials")
      .select(["id", "name_en", "name_ar", "photo_key", "position"])
      .where("capstone_id", "=", row.id)
      .orderBy("position", "asc")
      .execute(),
    db
      .selectFrom("capstone_photos")
      .select(["id", "photo_key", "position"])
      .where("capstone_id", "=", row.id)
      .orderBy("position", "asc")
      .execute(),
  ])

  return c.json({
    data: {
      ...row,
      card_photo_url: cdnUrl(cdn, row.card_photo_key),
      producers_photo_url: cdnUrl(cdn, row.producers_photo_key),
      students: people.filter((p) => p.role === "student"),
      supervisors: people.filter((p) => p.role === "supervisor"),
      materials: materials.map((m) => ({
        ...m,
        photo_url: cdnUrl(cdn, m.photo_key),
      })),
      photos: photos.map((p) => ({ ...p, url: cdnUrl(cdn, p.photo_key) })),
    },
  })
})

// ---------- Create ----------

app.post("/", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const db = c.get("db")
  const session = c.get("session")!
  const now = new Date().toISOString()
  const data = parsed.data

  // Hard cap per level prevents accidental data flooding.
  const countRow = await db
    .selectFrom("capstones")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("level", "=", data.level)
    .executeTakeFirstOrThrow()
  if (Number(countRow.count) >= MAX_PER_LEVEL) {
    return c.json(
      {
        error: "MAX_CAPSTONES_PER_LEVEL",
        limit: MAX_PER_LEVEL,
        level: data.level,
      },
      409,
    )
  }

  const slug = await uniqueSlug(db, data.title_en)

  const inserted = await db
    .insertInto("capstones")
    .values({
      slug,
      title_en: data.title_en,
      title_ar: data.title_ar,
      full_name_en: data.full_name_en,
      full_name_ar: data.full_name_ar,
      level: data.level,
      semester: data.semester,
      abstract_en: data.abstract_en,
      abstract_ar: data.abstract_ar,
      introduction_en: data.introduction_en,
      introduction_ar: data.introduction_ar,
      methodology_en: data.methodology_en,
      methodology_ar: data.methodology_ar,
      analysis_en: data.analysis_en,
      analysis_ar: data.analysis_ar,
      conclusion_en: data.conclusion_en,
      conclusion_ar: data.conclusion_ar,
      recommendations_en: data.recommendations_en,
      recommendations_ar: data.recommendations_ar,
      card_photo_key: data.card_photo_key ?? null,
      producers_photo_key: data.producers_photo_key ?? null,
      poster_link: data.poster_link ?? null,
      portfolio_link: data.portfolio_link ?? null,
      presentation_link: data.presentation_link ?? null,
      author_id: session.user.id,
      created_at: now,
      updated_at: now,
    })
    .returning(["id", "slug"])
    .executeTakeFirstOrThrow()

  // Insert children in parallel; nothing in here references the others.
  await Promise.all([
    replacePeople(db, inserted.id, "student", data.students, now),
    replacePeople(db, inserted.id, "supervisor", data.supervisors, now),
    replaceMaterials(db, inserted.id, data.materials, now),
    replacePhotos(db, inserted.id, data.photo_keys, now),
  ])

  return c.json({ data: { id: inserted.id, slug: inserted.slug } }, 201)
})

// ---------- Update ----------

app.patch("/:id", async (c) => {
  const idParsed = idSchema.safeParse(c.req.param("id"))
  if (!idParsed.success) return c.json({ error: "Invalid id" }, 400)
  const id = idParsed.data

  const body = await c.req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const db = c.get("db")
  const existing = await db
    .selectFrom("capstones")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst()
  if (!existing) return c.json({ error: "Not found" }, 404)

  const now = new Date().toISOString()
  const { students, supervisors, materials, photo_keys, ...rest } = parsed.data

  // Update the parent row first. Re-slug if the English title changed so the
  // public-facing URL stays in sync with the (renamed) project.
  const updateValues: Record<string, unknown> = { ...rest, updated_at: now }
  if (rest.title_en && rest.title_en !== existing.title_en) {
    updateValues.slug = await uniqueSlug(db, rest.title_en)
  }
  await db.updateTable("capstones").set(updateValues).where("id", "=", id).execute()

  // Track R2 keys orphaned by this update so we can delete them at the end
  // (after all DB writes commit, so a partial failure doesn't lose objects
  // that the DB still references).
  const keysToDelete: string[] = []

  // Card / producers photos: if the field is being replaced, the old key (if
  // any) is now unreferenced.
  for (const field of ["card_photo_key", "producers_photo_key"] as const) {
    if (field in parsed.data) {
      const oldKey = existing[field]
      const newKey = parsed.data[field] ?? null
      if (oldKey && oldKey !== newKey) keysToDelete.push(oldKey)
    }
  }

  // Replace child collections only when the patch includes them. Each helper
  // returns the photo keys that fell out of the new state, which we add to
  // the R2 cleanup list.
  if (students !== undefined) {
    await replacePeople(db, id, "student", students, now)
  }
  if (supervisors !== undefined) {
    await replacePeople(db, id, "supervisor", supervisors, now)
  }
  if (materials !== undefined) {
    keysToDelete.push(...(await replaceMaterials(db, id, materials, now)))
  }
  if (photo_keys !== undefined) {
    keysToDelete.push(...(await replacePhotos(db, id, photo_keys, now)))
  }

  await deleteObjects(c.env, keysToDelete)

  return c.json({ data: { id } })
})

// ---------- Delete ----------

app.delete("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  const id = parsed.data

  const db = c.get("db")
  const existing = await db
    .selectFrom("capstones")
    .select(["id", "card_photo_key", "producers_photo_key"])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!existing) return c.json({ error: "Not found" }, 404)

  const [photos, mats] = await Promise.all([
    db
      .selectFrom("capstone_photos")
      .select("photo_key")
      .where("capstone_id", "=", id)
      .execute(),
    db
      .selectFrom("capstone_materials")
      .select("photo_key")
      .where("capstone_id", "=", id)
      .execute(),
  ])

  await db.deleteFrom("capstones").where("id", "=", id).execute()

  // Sweep every photo that belonged to this capstone — card, producers,
  // gallery photos, and material thumbnails.
  const keys = [
    ...(existing.card_photo_key ? [existing.card_photo_key] : []),
    ...(existing.producers_photo_key ? [existing.producers_photo_key] : []),
    ...photos.map((p) => p.photo_key),
    ...mats.map((m) => m.photo_key).filter((k): k is string => Boolean(k)),
  ]
  await deleteObjects(c.env, keys)

  return c.json({ data: { id } })
})

export default app
