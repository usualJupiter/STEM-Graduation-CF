/**
 * Admin: Gallery photos (the public site's photo gallery).
 * Tracks file_size per row to enforce a 2 GB total cap (also pre-checked at
 * upload-sign time in routes/admin/uploads.ts).
 */
import { Hono } from "hono"
import { z } from "zod"

import { cdnUrl } from "../../lib/cdn"
import type { Db } from "../../lib/db"
import { requireAuth } from "../../lib/middleware"
import { deleteObjects } from "../../lib/r2"
import type { AppEnv } from "../../types"

const GALLERY_MAX_FILE_SIZE = 1024 * 1024
const GALLERY_MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024

const photoSchema = z.object({
  photo_key: z
    .string()
    .trim()
    .min(1)
    .refine((k) => k.startsWith("gallery/"), "Invalid photo key"),
  file_size: z.number().int().positive().max(GALLERY_MAX_FILE_SIZE),
  original_name: z.string().trim().max(255).optional(),
})

const createSchema = z.object({
  photos: z.array(photoSchema).min(1).max(5),
})

const idSchema = z.coerce.number().int().positive()

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  sort: z
    .enum(["dateNewest", "dateOldest", "nameAsc", "nameDesc"])
    .default("dateNewest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

// Sums file_size across all gallery_photos rows. Used by GET (display) and
// POST (cap enforcement); we re-check on POST in case other uploads landed
// between client-side cap pre-check and final commit.
async function loadUsage(db: Db): Promise<number> {
  const row = await db
    .selectFrom("gallery_photos")
    .select((eb) => eb.fn.sum<number>("file_size").as("total"))
    .executeTakeFirstOrThrow()
  return Number(row.total) || 0
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
  const { q, sort, page, limit } = parsed.data
  const db = c.get("db")

  let baseQuery = db
    .selectFrom("gallery_photos")
    .innerJoin("user", "user.id", "gallery_photos.author_id")
  if (q) {
    baseQuery = baseQuery.where("gallery_photos.original_name", "like", `%${q}%`)
  }

  const totalRow = await baseQuery
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  const total = Number(totalRow.count)

  let rowsQuery = baseQuery.select([
    "gallery_photos.id",
    "gallery_photos.photo_key",
    "gallery_photos.file_size",
    "gallery_photos.original_name",
    "gallery_photos.created_at",
    "user.name as author_name",
  ])
  switch (sort) {
    case "dateNewest":
      rowsQuery = rowsQuery
        .orderBy("gallery_photos.created_at", "desc")
        .orderBy("gallery_photos.id", "desc")
      break
    case "dateOldest":
      rowsQuery = rowsQuery
        .orderBy("gallery_photos.created_at", "asc")
        .orderBy("gallery_photos.id", "asc")
      break
    case "nameAsc":
      rowsQuery = rowsQuery.orderBy("gallery_photos.original_name", "asc")
      break
    case "nameDesc":
      rowsQuery = rowsQuery.orderBy("gallery_photos.original_name", "desc")
      break
  }

  const rows = await rowsQuery
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  const used = await loadUsage(db)
  const cdn = c.env.CDN_BASE
  const data = rows.map((row) => ({ ...row, url: cdnUrl(cdn, row.photo_key) }))

  return c.json({
    data,
    meta: {
      total,
      page,
      limit,
      used,
      capacity: GALLERY_MAX_TOTAL_SIZE,
      maxFileSize: GALLERY_MAX_FILE_SIZE,
    },
  })
})

// ---------- Create (commit uploaded photos) ----------

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

  // Re-check the cap server-side. If it's been exceeded since the pre-sign,
  // delete the now-orphaned R2 objects rather than letting them leak.
  const used = await loadUsage(db)
  const incoming = parsed.data.photos.reduce((s, p) => s + p.file_size, 0)
  if (used + incoming > GALLERY_MAX_TOTAL_SIZE) {
    await deleteObjects(
      c.env,
      parsed.data.photos.map((p) => p.photo_key),
    )
    return c.json(
      { error: "GALLERY_LIMIT_REACHED", limit: GALLERY_MAX_TOTAL_SIZE, used },
      409,
    )
  }

  const now = new Date().toISOString()
  const inserted = await db
    .insertInto("gallery_photos")
    .values(
      parsed.data.photos.map((p) => ({
        photo_key: p.photo_key,
        file_size: p.file_size,
        original_name: p.original_name ?? null,
        author_id: session.user.id,
        created_at: now,
      })),
    )
    .returning("id")
    .execute()

  return c.json({ data: { ids: inserted.map((r) => r.id) } }, 201)
})

// ---------- Delete ----------

app.delete("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  const id = parsed.data

  const db = c.get("db")
  const photo = await db
    .selectFrom("gallery_photos")
    .select(["id", "photo_key"])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!photo) return c.json({ error: "Not found" }, 404)

  await db.deleteFrom("gallery_photos").where("id", "=", id).execute()
  await deleteObjects(c.env, [photo.photo_key])

  return c.json({ data: { id } })
})

export default app
