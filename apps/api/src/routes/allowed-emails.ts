import { Hono } from "hono"
import { z } from "zod"

import type { AppEnv } from "../types"

const addSchema = z.object({
  email: z
    .email()
    .transform((s) => s.toLowerCase().trim()),
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
  const db = c.get("db")
  const rows = await db
    .selectFrom("allowed_emails")
    .selectAll()
    .orderBy("addedAt", "desc")
    .execute()
  return c.json({ data: rows })
})

app.post("/", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const db = c.get("db")
  const session = c.get("session")!
  const email = parsed.data.email

  try {
    await db
      .insertInto("allowed_emails")
      .values({
        email,
        addedByUserId: session.user.id,
        addedAt: new Date().toISOString(),
      })
      .execute()
  } catch {
    return c.json({ error: "Email already in allowlist" }, 409)
  }
  return c.json({ data: { email } }, 201)
})

app.delete("/:email", async (c) => {
  const email = c.req.param("email").toLowerCase()
  const db = c.get("db")

  await db.deleteFrom("allowed_emails").where("email", "=", email).execute()

  const user = await db
    .selectFrom("user")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirst()
  if (user) {
    await db.deleteFrom("session").where("userId", "=", user.id).execute()
  }

  return c.json({ data: { email } })
})

export default app
