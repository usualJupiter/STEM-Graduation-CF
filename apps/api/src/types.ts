import type { Auth } from "./lib/auth"
import type { Db } from "./lib/db"

export type SessionData = Auth["$Infer"]["Session"]

export type AppEnv = {
  Bindings: CloudflareBindings
  Variables: {
    auth: Auth
    db: Db
    session?: SessionData
  }
}
