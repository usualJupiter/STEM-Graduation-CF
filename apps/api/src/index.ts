import { Hono } from "hono"
import { cors } from "hono/cors"

import { createAuth } from "./lib/auth"
import { createDb } from "./lib/db"
import adminCapstones from "./routes/admin/capstones"
import adminEvents from "./routes/admin/events"
import adminGallery from "./routes/admin/gallery"
import adminSchedules from "./routes/admin/schedules"
import adminUploads from "./routes/admin/uploads"
import allowedEmails from "./routes/allowed-emails"
import capstones from "./routes/capstones"
import events from "./routes/events"
import gallery from "./routes/gallery"
import schedules from "./routes/schedules"
import type { AppEnv } from "./types"

const app = new Hono<AppEnv>()

app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.stem_db))
  c.set("auth", createAuth(c.env))
  c.set("session", null)
  await next()
})

app.use("/api/*", (c, next) => {
  const origins = c.env.TRUSTED_ORIGINS
    ? c.env.TRUSTED_ORIGINS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  return cors({
    origin: origins,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })(c, next)
})

app.on(["POST", "GET"], "/api/auth/*", (c) =>
  c.get("auth").handler(c.req.raw),
)

app.route("/api/allowed-emails", allowedEmails)
app.route("/api/events", events)
app.route("/api/capstones", capstones)
app.route("/api/gallery", gallery)
app.route("/api/schedules", schedules)
app.route("/api/admin/events", adminEvents)
app.route("/api/admin/capstones", adminCapstones)
app.route("/api/admin/uploads", adminUploads)
app.route("/api/admin/gallery", adminGallery)
app.route("/api/admin/schedules", adminSchedules)

app.get("/", (c) => c.text("STEM API"))

export default app
