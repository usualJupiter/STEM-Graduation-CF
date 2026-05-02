import { Hono } from "hono"
import { cors } from "hono/cors"

import { createAuth, type Auth } from "./lib/auth"
import { createDb, type Db } from "./lib/db"
import adminAllowedEmails from "./routes/admin/allowed-emails"
import adminApplications from "./routes/admin/applications"
import adminCapstones from "./routes/admin/capstones"
import adminDashboard from "./routes/admin/dashboard"
import adminEvents from "./routes/admin/events"
import adminGallery from "./routes/admin/gallery"
import adminSchedules from "./routes/admin/schedules"
import adminUploads from "./routes/admin/uploads"
import publicApplications from "./routes/public/applications"
import publicCapstones from "./routes/public/capstones"
import publicEvents from "./routes/public/events"
import publicGallery from "./routes/public/gallery"
import publicSchedules from "./routes/public/schedules"
import type { AppEnv } from "./types"

// Workers reuses isolates across requests. Hold onto these so Better Auth's
// cookieCache and Kysely's compiled-query cache survive between requests.
let cachedAuth: Auth | undefined
let cachedDb: Db | undefined
let cachedOrigins: string[] | undefined

function getAuth(env: CloudflareBindings): Auth {
  if (!cachedAuth) cachedAuth = createAuth(env)
  return cachedAuth
}
function getDb(env: CloudflareBindings): Db {
  if (!cachedDb) cachedDb = createDb(env.stem_db)
  return cachedDb
}
function getOrigins(env: CloudflareBindings): string[] {
  if (cachedOrigins) return cachedOrigins
  const raw = env.TRUSTED_ORIGINS
  cachedOrigins = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  return cachedOrigins
}

const app = new Hono<AppEnv>()

app.use("*", async (c, next) => {
  c.set("db", getDb(c.env))
  c.set("auth", getAuth(c.env))
  await next()
})

app.use("/api/*", (c, next) =>
  cors({
    origin: getOrigins(c.env),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })(c, next),
)

app.all("/api/auth/*", (c) => c.get("auth").handler(c.req.raw))

// Public API — consumed by apps/web
app.route("/api/events", publicEvents)
app.route("/api/capstones", publicCapstones)
app.route("/api/gallery", publicGallery)
app.route("/api/schedules", publicSchedules)
app.route("/api/applications", publicApplications)

// Admin API — consumed by apps/admin (auth-gated inside each route via requireAuth)
app.route("/api/admin/allowed-emails", adminAllowedEmails)
app.route("/api/admin/dashboard", adminDashboard)
app.route("/api/admin/events", adminEvents)
app.route("/api/admin/capstones", adminCapstones)
app.route("/api/admin/uploads", adminUploads)
app.route("/api/admin/gallery", adminGallery)
app.route("/api/admin/schedules", adminSchedules)
app.route("/api/admin/applications", adminApplications)

app.get("/", (c) => c.text("STEM API"))
app.get("/health", (c) => c.json({ status: "ok" }))

app.notFound((c) => c.json({ error: "Not found" }, 404))

app.onError((err, c) => {
  // Echo cf-ray so prod errors surfaced to users can be cross-referenced
  // with Workers logs / Cloudflare's request trail.
  const ray = c.req.header("cf-ray") ?? null
  console.error("[api] unhandled error", { ray, err })
  return c.json({ error: "Internal server error", ray }, 500)
})

export default app
