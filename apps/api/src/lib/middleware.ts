import type { MiddlewareHandler } from "hono"

import type { AppEnv } from "../types"

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await c
    .get("auth")
    .api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  // Re-check the allowlist on every authed request. Better Auth's user.create.before
  // hook only gates first-time sign-up, so removing a member from allowed_emails
  // (which only deletes their existing sessions, not the user row) wouldn't otherwise
  // stop them from re-authenticating with the same Google account.
  const allowed = await c
    .get("db")
    .selectFrom("allowed_emails")
    .select("email")
    .where("email", "=", session.user.email.toLowerCase())
    .executeTakeFirst()
  if (!allowed) return c.json({ error: "Forbidden" }, 403)

  c.set("session", session)
  await next()
}
