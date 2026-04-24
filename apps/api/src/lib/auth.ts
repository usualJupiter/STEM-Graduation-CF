import { betterAuth } from "better-auth"

import { createDb } from "./db"

export function createAuth(env: CloudflareBindings) {
  const db = createDb(env.stem_db)

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: {
      db,
      type: "sqlite",
      transaction: false,
    },
    trustedOrigins: env.TRUSTED_ORIGINS
      ? env.TRUSTED_ORIGINS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: "select_account",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const allowed = await db
              .selectFrom("allowed_emails")
              .select("email")
              .where("email", "=", user.email.toLowerCase())
              .executeTakeFirst()
            if (!allowed) return false
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const userRow = await db
              .selectFrom("user")
              .select("email")
              .where("id", "=", session.userId)
              .executeTakeFirst()
            if (!userRow) return false

            const allowed = await db
              .selectFrom("allowed_emails")
              .select("email")
              .where("email", "=", userRow.email.toLowerCase())
              .executeTakeFirst()
            if (!allowed) return false
          },
        },
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
