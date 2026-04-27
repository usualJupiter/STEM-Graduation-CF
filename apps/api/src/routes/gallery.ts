import { Hono } from "hono"
import { z } from "zod"

import type { AppEnv } from "../types"

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
})

function photoUrl(cdnBase: string, key: string): string {
  return `${cdnBase.replace(/\/$/, "")}/${key.replace(/^\//, "")}`
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
  const { page, limit } = parsed.data
  const db = c.get("db")
  const cdn = c.env.CDN_BASE

  const totalRow = await db
    .selectFrom("gallery_photos")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  const total = Number(totalRow.count)

  const rows = await db
    .selectFrom("gallery_photos")
    .select(["id", "photo_key", "created_at"])
    .orderBy("created_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  const data = rows.map((row) => ({
    id: row.id,
    url: photoUrl(cdn, row.photo_key),
    created_at: row.created_at,
  }))

  return c.json({ data, meta: { total, page, limit } })
})

export default app
