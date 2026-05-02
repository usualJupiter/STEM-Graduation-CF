/**
 * Public: Lecture schedule URLs (one Google Drive preview link per level).
 * Returns just `level` and `drive_url`; admin metadata (updated_at, updated_by)
 * is intentionally not exposed to the public site.
 */
import { Hono } from "hono"

import type { AppEnv } from "../../types"

const app = new Hono<AppEnv>()

app.get("/", async (c) => {
  const db = c.get("db")
  const rows = await db
    .selectFrom("schedule_levels")
    .select(["level", "drive_url"])
    .orderBy("level", "asc")
    .execute()
  return c.json({ data: rows })
})

export default app
