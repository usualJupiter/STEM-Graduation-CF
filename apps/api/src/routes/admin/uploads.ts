/**
 * Admin: Stores uploaded images in R2 via the bucket binding.
 * The client compresses inputs to webp before sending; this endpoint validates
 * size/prefix and writes the bytes, naming each object `{prefix}/{uuid}.webp`.
 * Using the binding (instead of presigned S3 URLs) means dev writes to local R2
 * and prod writes to prod R2 automatically — no cross-origin PUT to prod.
 */
import { Hono } from "hono"
import { z } from "zod"

import { requireAuth } from "../../lib/middleware"
import type { AppEnv } from "../../types"

const MAX_FILE_SIZE = 1024 * 1024
const MAX_BATCH = 5
const GALLERY_TOTAL_LIMIT = 2 * 1024 * 1024 * 1024

const PREFIXES = ["events", "capstones", "gallery"] as const
const prefixSchema = z.enum(PREFIXES)

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

app.post("/", async (c) => {
  const form = await c.req.formData().catch(() => null)
  if (!form) return c.json({ error: "Invalid payload" }, 400)

  const prefixParsed = prefixSchema.safeParse(form.get("prefix"))
  if (!prefixParsed.success) {
    return c.json(
      { error: "Invalid payload", issues: prefixParsed.error.issues },
      400,
    )
  }
  const prefix = prefixParsed.data

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File)
  if (files.length === 0 || files.length > MAX_BATCH) {
    return c.json({ error: "Invalid payload" }, 400)
  }
  for (const file of files) {
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return c.json({ error: "Invalid payload" }, 400)
    }
  }

  // Gallery has a 2 GB total cap. Reject the batch up front if it would exceed
  // it; events/capstones uploads are unbounded (their own row counts cap them).
  if (prefix === "gallery") {
    const db = c.get("db")
    const usageRow = await db
      .selectFrom("gallery_photos")
      .select((eb) => eb.fn.sum<number>("file_size").as("total"))
      .executeTakeFirstOrThrow()
    const used = Number(usageRow.total) || 0
    const incoming = files.reduce((sum, f) => sum + f.size, 0)
    if (used + incoming > GALLERY_TOTAL_LIMIT) {
      return c.json(
        { error: "GALLERY_LIMIT_REACHED", limit: GALLERY_TOTAL_LIMIT, used },
        409,
      )
    }
  }

  const items = await Promise.all(
    files.map(async (file) => {
      const key = `${prefix}/${crypto.randomUUID()}.webp`
      await c.env.PUBLIC_MEDIA.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: "image/webp" },
      })
      return { key, size: file.size }
    }),
  )

  return c.json({ data: { items } })
})

export default app
