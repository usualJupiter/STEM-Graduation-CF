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

const signSchema = z.object({
  contentType: z
    .string()
    .refine((t) => t in ALLOWED_TYPES, "Unsupported content type"),
  kind: z.enum(["card", "gallery"]),
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

export default app
