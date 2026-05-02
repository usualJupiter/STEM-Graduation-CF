import { z } from "zod"

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8787"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z
    .string()
    .min(1)
    .default("1x00000000000000000000AA"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:8787"),
})

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_URL: process.env.API_URL,
})

if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`)
}

export const env = parsed.data
