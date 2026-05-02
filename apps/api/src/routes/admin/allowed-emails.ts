/**
 * Admin: Manages the allowlist of admin emails.
 * Only emails listed here can sign in via Google OAuth (enforced by both the
 * Better Auth user.create.before hook and `requireAuth`'s allowlist re-check).
 */
import { Hono } from "hono"
import { sql } from "kysely"
import { z } from "zod"

import { requireAuth } from "../../lib/middleware"
import type { AppEnv } from "../../types"

const addSchema = z.object({
  email: z
    .email()
    .transform((s) => s.toLowerCase().trim()),
})

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

app.get("/", async (c) => {
  const db = c.get("db")
  const rows = await db
    .selectFrom("allowed_emails")
    .leftJoin("user", (join) =>
      join.on(sql`lower(user.email)`, "=", sql`allowed_emails.email`),
    )
    .select([
      "allowed_emails.email",
      "allowed_emails.is_default",
      "allowed_emails.addedAt as added_at",
      "user.name",
      "user.image",
    ])
    .orderBy("allowed_emails.addedAt", "desc")
    .execute()

  const data = rows.map((r) => ({
    email: r.email,
    name: r.name ?? null,
    image: r.image ?? null,
    added_at: r.added_at,
    is_default: Boolean(r.is_default),
  }))

  return c.json({ data })
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

  const existing = await db
    .selectFrom("allowed_emails")
    .select("email")
    .where("email", "=", email)
    .executeTakeFirst()
  if (existing) {
    return c.json({ error: "Email already in allowlist" }, 409)
  }

  await db
    .insertInto("allowed_emails")
    .values({
      email,
      addedByUserId: session.user.id,
      addedAt: new Date().toISOString(),
    })
    .execute()

  return c.json({ data: { email } }, 201)
})

app.delete("/:email", async (c) => {
  const email = c.req.param("email").toLowerCase()
  const session = c.get("session")!

  if (email === session.user.email.toLowerCase()) {
    return c.json({ error: "Cannot remove yourself" }, 403)
  }

  const db = c.get("db")
  const row = await db
    .selectFrom("allowed_emails")
    .select("is_default")
    .where("email", "=", email)
    .executeTakeFirst()

  if (!row) {
    return c.json({ error: "Not found" }, 404)
  }
  if (row.is_default) {
    return c.json({ error: "Cannot remove default admin" }, 403)
  }

  await db.deleteFrom("allowed_emails").where("email", "=", email).execute()

  // Revoke existing sessions so the removed user is signed out immediately.
  // The user row is intentionally kept — re-allowing the email later will let
  // them sign back in without re-creating their record. The allowlist re-check
  // in `requireAuth` covers the gap if their session is still cookie-cached.
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
