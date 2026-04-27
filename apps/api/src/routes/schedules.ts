import { Hono } from "hono"

import type { AppEnv } from "../types"

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
