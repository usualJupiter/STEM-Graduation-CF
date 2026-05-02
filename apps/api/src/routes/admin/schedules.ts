import { Hono } from "hono"
import { z } from "zod"

import { requireAuth } from "../../lib/middleware"
import type { AppEnv } from "../../types"

const updateSchema = z.object({
  levels: z
    .array(
      z.object({
        level: z.number().int().min(1).max(4),
        drive_url: z.string().trim().url(),
      }),
    )
    .min(1)
    .max(4),
})

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

app.get("/", async (c) => {
  const db = c.get("db")
  const rows = await db
    .selectFrom("schedule_levels")
    .selectAll()
    .orderBy("level", "asc")
    .execute()
  return c.json({ data: rows })
})

app.put("/", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const levels = parsed.data.levels.map((l) => l.level)
  if (new Set(levels).size !== levels.length) {
    return c.json({ error: "Duplicate levels" }, 400)
  }

  const db = c.get("db")
  const session = c.get("session")!
  const now = new Date().toISOString()

  await Promise.all(
    parsed.data.levels.map((item) =>
      db
        .updateTable("schedule_levels")
        .set({
          drive_url: item.drive_url,
          updated_at: now,
          updated_by: session.user.id,
        })
        .where("level", "=", item.level)
        .execute(),
    ),
  )

  return c.json({ data: { updated: parsed.data.levels.length } })
})

export default app
