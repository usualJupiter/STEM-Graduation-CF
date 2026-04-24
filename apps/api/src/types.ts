import type { Auth } from "./lib/auth"
import type { Db } from "./lib/db"

export type SessionData = NonNullable<
  Awaited<ReturnType<Auth["api"]["getSession"]>>
>

export type AppEnv = {
  Bindings: CloudflareBindings
  Variables: {
    auth: Auth
    db: Db
    session: SessionData | null
  }
}
