import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Hono } from "hono"
import { z } from "zod"

import { requireAuth } from "../../lib/middleware"
import { BUCKET_NAME, createS3Client } from "../../lib/r2"
import type { AppEnv } from "../../types"

const MAX_FILE_SIZE = 1024 * 1024
const MAX_BATCH = 5
const GALLERY_TOTAL_LIMIT = 2 * 1024 * 1024 * 1024

const PREFIXES = ["events", "capstones", "gallery"] as const

const signSchema = z.object({
  prefix: z.enum(PREFIXES),
  files: z
    .array(z.object({ size: z.number().int().positive().max(MAX_FILE_SIZE) }))
    .min(1)
    .max(MAX_BATCH),
})

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

app.post("/sign", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = signSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const { prefix, files } = parsed.data

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

  const s3 = createS3Client(c.env)
  const items = await Promise.all(
    files.map(async () => {
      const key = `${prefix}/${crypto.randomUUID()}.webp`
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: "image/webp",
        }),
        { expiresIn: 600 },
      )
      return { uploadUrl, key }
    }),
  )

  return c.json({ data: { items } })
})

export default app
