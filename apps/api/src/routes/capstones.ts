import { Hono } from "hono"
import { z } from "zod"

import type { AppEnv } from "../types"

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  level: z.coerce.number().int().min(1).max(3).optional(),
  sort: z
    .enum(["dateNewest", "dateOldest", "nameAsc", "nameDesc"])
    .default("dateNewest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
})

function photoUrl(cdnBase: string, key: string): string {
  return `${cdnBase.replace(/\/$/, "")}/${key.replace(/^\//, "")}`
}

function maybeUrl(cdnBase: string, key: string | null): string | null {
  return key ? photoUrl(cdnBase, key) : null
}

const app = new Hono<AppEnv>()

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
  const cdn = c.env.CDN_BASE

  let baseQuery = db.selectFrom("capstones")
  if (q) {
    const like = `%${q}%`
    baseQuery = baseQuery.where((eb) =>
      eb.or([eb("title_en", "like", like), eb("title_ar", "like", like)]),
    )
  }
  if (level) baseQuery = baseQuery.where("level", "=", level)

  const totalRow = await baseQuery
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  const total = Number(totalRow.count)

  let rowsQuery = baseQuery.select([
    "id",
    "slug",
    "title_en",
    "title_ar",
    "level",
    "semester",
    "card_photo_key",
    "created_at",
  ])
  switch (sort) {
    case "dateNewest":
      rowsQuery = rowsQuery.orderBy("created_at", "desc")
      break
    case "dateOldest":
      rowsQuery = rowsQuery.orderBy("created_at", "asc")
      break
    case "nameAsc":
      rowsQuery = rowsQuery.orderBy("title_en", "asc")
      break
    case "nameDesc":
      rowsQuery = rowsQuery.orderBy("title_en", "desc")
      break
  }

  const rows = await rowsQuery
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  const data = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title_en: row.title_en,
    title_ar: row.title_ar,
    level: row.level,
    semester: row.semester,
    card_photo_url: maybeUrl(cdn, row.card_photo_key),
    created_at: row.created_at,
  }))

  return c.json({ data, meta: { total, page, limit } })
})

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug").trim()
  if (!slug) return c.json({ error: "Invalid slug" }, 400)

  const db = c.get("db")
  const cdn = c.env.CDN_BASE

  const row = await db
    .selectFrom("capstones")
    .selectAll()
    .where("slug", "=", slug)
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
      id: row.id,
      slug: row.slug,
      title_en: row.title_en,
      title_ar: row.title_ar,
      full_name_en: row.full_name_en,
      full_name_ar: row.full_name_ar,
      level: row.level,
      semester: row.semester,
      abstract_en: row.abstract_en,
      abstract_ar: row.abstract_ar,
      introduction_en: row.introduction_en,
      introduction_ar: row.introduction_ar,
      methodology_en: row.methodology_en,
      methodology_ar: row.methodology_ar,
      analysis_en: row.analysis_en,
      analysis_ar: row.analysis_ar,
      conclusion_en: row.conclusion_en,
      conclusion_ar: row.conclusion_ar,
      recommendations_en: row.recommendations_en,
      recommendations_ar: row.recommendations_ar,
      card_photo_url: maybeUrl(cdn, row.card_photo_key),
      producers_photo_url: maybeUrl(cdn, row.producers_photo_key),
      poster_link: row.poster_link,
      portfolio_link: row.portfolio_link,
      presentation_link: row.presentation_link,
      students: people
        .filter((p) => p.role === "student")
        .map((p) => ({
          id: p.id,
          name_en: p.name_en,
          name_ar: p.name_ar,
          position: p.position,
        })),
      supervisors: people
        .filter((p) => p.role === "supervisor")
        .map((p) => ({
          id: p.id,
          name_en: p.name_en,
          name_ar: p.name_ar,
          position: p.position,
        })),
      materials: materials.map((m) => ({
        id: m.id,
        name_en: m.name_en,
        name_ar: m.name_ar,
        photo_url: maybeUrl(cdn, m.photo_key),
        position: m.position,
      })),
      photos: photos.map((p) => ({
        id: p.id,
        url: photoUrl(cdn, p.photo_key),
        position: p.position,
      })),
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  })
})

export default app
