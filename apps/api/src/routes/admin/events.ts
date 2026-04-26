import { Hono } from "hono"
import { z } from "zod"

import { deleteObjects } from "../../lib/r2"
import type { AppEnv } from "../../types"

const MAX_EVENTS = 30

const photoKeysSchema = z.array(z.string().min(1)).max(5)

const createSchema = z.object({
  title_en: z.string().trim().min(1),
  title_ar: z.string().trim().min(1),
  description_en: z.string().trim().min(1),
  description_ar: z.string().trim().min(1),
  event_date: z.string().trim().min(1),
  event_time: z.string().trim().min(1),
  card_photo_key: z.string().trim().min(1).nullable().optional(),
  photo_keys: photoKeysSchema.optional(),
})

const updateSchema = createSchema.partial()

const idSchema = z.coerce.number().int().positive()

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  sort: z
    .enum(["dateNewest", "dateOldest", "titleAsc", "titleDesc"])
    .default("dateNewest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const app = new Hono<AppEnv>()

app.use("*", async (c, next) => {
  const auth = c.get("auth")
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)
  c.set("session", session)
  await next()
})

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
    .selectFrom("events")
    .innerJoin("user", "user.id", "events.author_id")
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

  let rowsQuery = baseQuery.select([
    "events.id",
    "events.title_en",
    "events.title_ar",
    "events.event_date",
    "events.event_time",
    "events.card_photo_key",
    "events.created_at",
    "user.name as author_name",
  ])
  switch (sort) {
    case "dateNewest":
      rowsQuery = rowsQuery
        .orderBy("events.event_date", "desc")
        .orderBy("events.id", "desc")
      break
    case "dateOldest":
      rowsQuery = rowsQuery
        .orderBy("events.event_date", "asc")
        .orderBy("events.id", "asc")
      break
    case "titleAsc":
      rowsQuery = rowsQuery.orderBy("events.title_en", "asc")
      break
    case "titleDesc":
      rowsQuery = rowsQuery.orderBy("events.title_en", "desc")
      break
  }

  const rows = await rowsQuery
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  return c.json({ data: rows, meta: { total, page, limit } })
})

app.get("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)

  const db = c.get("db")
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

  return c.json({ data: { ...event, photos } })
})

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

  const countRow = await db
    .selectFrom("events")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  if (Number(countRow.count) >= MAX_EVENTS) {
    return c.json(
      { error: "MAX_EVENTS_REACHED", limit: MAX_EVENTS },
      409,
    )
  }

  const inserted = await db
    .insertInto("events")
    .values({
      title_en: parsed.data.title_en,
      title_ar: parsed.data.title_ar,
      description_en: parsed.data.description_en,
      description_ar: parsed.data.description_ar,
      event_date: parsed.data.event_date,
      event_time: parsed.data.event_time,
      card_photo_key: parsed.data.card_photo_key ?? null,
      author_id: session.user.id,
      created_at: now,
      updated_at: now,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  if (parsed.data.photo_keys && parsed.data.photo_keys.length > 0) {
    await db
      .insertInto("event_photos")
      .values(
        parsed.data.photo_keys.map((key, idx) => ({
          event_id: inserted.id,
          photo_key: key,
          position: idx,
          created_at: now,
        })),
      )
      .execute()
  }

  return c.json({ data: { id: inserted.id } }, 201)
})

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
    .selectFrom("events")
    .select(["id", "card_photo_key"])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!existing) return c.json({ error: "Not found" }, 404)

  const now = new Date().toISOString()
  const { photo_keys, ...rest } = parsed.data

  const updateValues: Record<string, unknown> = { ...rest, updated_at: now }
  await db.updateTable("events").set(updateValues).where("id", "=", id).execute()

  // If card_photo_key was changed (or cleared), delete the old object
  if (
    "card_photo_key" in parsed.data &&
    existing.card_photo_key &&
    existing.card_photo_key !== parsed.data.card_photo_key
  ) {
    await deleteObjects(c.env, [existing.card_photo_key])
  }

  // If photo_keys provided, replace the whole gallery
  if (photo_keys !== undefined) {
    const oldPhotos = await db
      .selectFrom("event_photos")
      .select("photo_key")
      .where("event_id", "=", id)
      .execute()
    await db.deleteFrom("event_photos").where("event_id", "=", id).execute()
    if (photo_keys.length > 0) {
      await db
        .insertInto("event_photos")
        .values(
          photo_keys.map((key, idx) => ({
            event_id: id,
            photo_key: key,
            position: idx,
            created_at: now,
          })),
        )
        .execute()
    }
    const removedKeys = oldPhotos
      .map((p) => p.photo_key)
      .filter((k) => !photo_keys.includes(k))
    await deleteObjects(c.env, removedKeys)
  }

  return c.json({ data: { id } })
})

app.delete("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  const id = parsed.data

  const db = c.get("db")
  const event = await db
    .selectFrom("events")
    .select(["id", "card_photo_key"])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!event) return c.json({ error: "Not found" }, 404)

  const photos = await db
    .selectFrom("event_photos")
    .select("photo_key")
    .where("event_id", "=", id)
    .execute()

  await db.deleteFrom("events").where("id", "=", id).execute()

  const keys = [
    ...(event.card_photo_key ? [event.card_photo_key] : []),
    ...photos.map((p) => p.photo_key),
  ]
  await deleteObjects(c.env, keys)

  return c.json({ data: { id } })
})

export default app
