import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Hono } from "hono"
import { z } from "zod"

import { BUCKET_NAME, createS3Client } from "../../lib/r2"
import type { AppEnv } from "../../types"

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const CAPSTONE_TYPES: Record<string, string> = {
  "image/webp": "webp",
}

const CAPSTONE_MAX_FILE_SIZE = 1024 * 1024

const GALLERY_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

const GALLERY_MAX_FILE_SIZE = 1024 * 1024
const GALLERY_MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024

const signSchema = z.object({
  contentType: z
    .string()
    .refine((t) => t in ALLOWED_TYPES, "Unsupported content type"),
  kind: z.enum(["card", "gallery"]),
})

const capstoneSignSchema = z.object({
  contentType: z
    .string()
    .refine((t) => t in CAPSTONE_TYPES, "Unsupported content type"),
  kind: z.enum(["card", "gallery", "material", "producers"]),
  fileSize: z.number().int().positive().max(CAPSTONE_MAX_FILE_SIZE).optional(),
})

const gallerySignSchema = z.object({
  files: z
    .array(
      z.object({
        contentType: z
          .string()
          .refine((t) => t in GALLERY_TYPES, "Unsupported content type"),
        fileSize: z.number().int().positive().max(GALLERY_MAX_FILE_SIZE),
      }),
    )
    .min(1)
    .max(5),
})

const app = new Hono<AppEnv>()

app.use("*", async (c, next) => {
  const auth = c.get("auth")
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)
  c.set("session", session)
  await next()
})

app.post("/event-photos/sign", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = signSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const ext = ALLOWED_TYPES[parsed.data.contentType]
  const key = `events/${crypto.randomUUID()}.${ext}`

  const s3 = createS3Client(c.env)
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: parsed.data.contentType,
    }),
    { expiresIn: 600 },
  )

  return c.json({ data: { uploadUrl, key } })
})

app.post("/capstones/sign", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = capstoneSignSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const ext = CAPSTONE_TYPES[parsed.data.contentType]
  const key = `capstones/${crypto.randomUUID()}.${ext}`

  const s3 = createS3Client(c.env)
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: parsed.data.contentType,
    }),
    { expiresIn: 600 },
  )

  return c.json({ data: { uploadUrl, key } })
})

app.post("/gallery/sign", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = gallerySignSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }

  const db = c.get("db")
  const usageRow = await db
    .selectFrom("gallery_photos")
    .select((eb) => eb.fn.sum<number>("file_size").as("total"))
    .executeTakeFirstOrThrow()
  const used = Number(usageRow.total) || 0
  const incoming = parsed.data.files.reduce((sum, f) => sum + f.fileSize, 0)

  if (used + incoming > GALLERY_MAX_TOTAL_SIZE) {
    return c.json(
      {
        error: "GALLERY_LIMIT_REACHED",
        limit: GALLERY_MAX_TOTAL_SIZE,
        used,
      },
      409,
    )
  }

  const s3 = createS3Client(c.env)
  const items = await Promise.all(
    parsed.data.files.map(async (file) => {
      const ext = GALLERY_TYPES[file.contentType]
      const key = `gallery/${crypto.randomUUID()}.${ext}`
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: file.contentType,
        }),
        { expiresIn: 600 },
      )
      return { uploadUrl, key }
    }),
  )

  return c.json({ data: { items } })
})

export default app
