/**
 * Public: Read-only event listings + detail.
 * Public response strips author info and any non-display fields; admin-only
 * data lives in routes/admin/events.ts.
 */
import { Hono } from "hono"
import { z } from "zod"

import { cdnUrl } from "../../lib/cdn"
import type { AppEnv } from "../../types"

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  sort: z
    .enum(["dateNewest", "dateOldest", "titleAsc", "titleDesc"])
    .default("dateNewest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const idSchema = z.coerce.number().int().positive()

const app = new Hono<AppEnv>()

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
  const cdn = c.env.CDN_BASE

  let baseQuery = db.selectFrom("events")
  if (q) {
    const like = `%${q}%`
    baseQuery = baseQuery.where((eb) =>
      eb.or([eb("title_en", "like", like), eb("title_ar", "like", like)]),
    )
  }

  const totalRow = await baseQuery
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  const total = Number(totalRow.count)

  let rowsQuery = baseQuery.selectAll()
  switch (sort) {
    case "dateNewest":
      rowsQuery = rowsQuery.orderBy("event_date", "desc").orderBy("id", "desc")
      break
    case "dateOldest":
      rowsQuery = rowsQuery.orderBy("event_date", "asc").orderBy("id", "asc")
      break
    case "titleAsc":
      rowsQuery = rowsQuery.orderBy("title_en", "asc")
      break
    case "titleDesc":
      rowsQuery = rowsQuery.orderBy("title_en", "desc")
      break
  }

  const rows = await rowsQuery
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  const data = rows.map((row) => ({
    id: row.id,
    title_en: row.title_en,
    title_ar: row.title_ar,
    description_en: row.description_en,
    description_ar: row.description_ar,
    event_date: row.event_date,
    event_time: row.event_time,
    card_photo_url: cdnUrl(cdn, row.card_photo_key),
    created_at: row.created_at,
  }))

  return c.json({ data, meta: { total, page, limit } })
})

// ---------- Detail ----------

app.get("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)

  const db = c.get("db")
  const cdn = c.env.CDN_BASE

  const event = await db
    .selectFrom("events")
    .selectAll()
    .where("id", "=", parsed.data)
    .executeTakeFirst()

  if (!event) return c.json({ error: "Not found" }, 404)

  const photos = await db
    .selectFrom("event_photos")
    .select(["id", "photo_key", "position"])
    .where("event_id", "=", event.id)
    .orderBy("position", "asc")
    .execute()

  return c.json({
    data: {
      id: event.id,
      title_en: event.title_en,
      title_ar: event.title_ar,
      description_en: event.description_en,
      description_ar: event.description_ar,
      event_date: event.event_date,
      event_time: event.event_time,
      card_photo_url: cdnUrl(cdn, event.card_photo_key),
      photos: photos.map((p) => ({
        id: p.id,
        position: p.position,
        url: cdnUrl(cdn, p.photo_key),
      })),
      created_at: event.created_at,
    },
  })
})

export default app
