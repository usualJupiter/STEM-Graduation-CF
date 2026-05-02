import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { z } from "zod"

import {
  IMAGE_CONTENT_TYPE,
  IMAGE_EXT,
  detectImageKind,
  isPdf,
} from "../lib/fileType"
import { verifyTurnstile } from "../lib/turnstile"
import type { AppEnv } from "../types"

const PHOTO_MAX_BYTES = 1 * 1024 * 1024
const CERT_MAX_BYTES = 5 * 1024 * 1024
const COOKIE_NAME = "app_submitted"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const DDMMYYYY = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/
const MMYYYY = /^(0[1-9]|1[0-2])\/(\d{4})$/
const HOME_PHONE = /^088\d{7}$/
const EG_MOBILE = /^01[0125]\d{8}$/

function ageOnNextOctober(birthdate: string): number | null {
  const m = DDMMYYYY.exec(birthdate)
  if (!m) return null
  const [, dd, mm, yyyy] = m
  const bd = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)))
  if (Number.isNaN(bd.getTime())) return null
  const now = new Date()
  const targetYear =
    now.getUTCMonth() < 9 ? now.getUTCFullYear() : now.getUTCFullYear() + 1
  const target = new Date(Date.UTC(targetYear, 9, 1))
  let age = target.getUTCFullYear() - bd.getUTCFullYear()
  const monthDiff = target.getUTCMonth() - bd.getUTCMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && target.getUTCDate() < bd.getUTCDate())
  ) {
    age -= 1
  }
  return age >= 0 ? age : null
}

const fieldsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nationality: z.string().trim().min(1).max(100),
  religion: z.string().trim().min(1).max(50),
  residence: z.string().trim().min(1).max(300),
  home_phone: z.string().trim().regex(HOME_PHONE, "Invalid home phone"),
  mobile: z.string().trim().regex(EG_MOBILE, "Invalid Egyptian mobile"),
  birthdate: z.string().trim().regex(DDMMYYYY, "Invalid birthdate"),
  birthplace: z.string().trim().min(1).max(100),
  national_id: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "National ID must be 14 digits"),
  id_issuing_authority: z.string().trim().min(1).max(200),
  id_issue_date: z.string().trim().regex(MMYYYY, "Invalid ID issue date"),
  guardian_name: z.string().trim().min(1).max(200),
  guardian_job: z.string().trim().min(1).max(200),
  guardian_address: z.string().trim().min(1).max(300),
  guardian_mobile: z.string().trim().regex(EG_MOBILE, "Invalid Egyptian mobile"),
  certificate: z.string().trim().min(1).max(200),
  graduation_year: z.string().trim().regex(/^\d{4}$/, "4-digit year"),
  total_grades: z.string().trim().min(1).max(20),
  first_language: z.string().trim().min(1).max(100),
  second_language: z.string().trim().min(1).max(100),
  school: z.string().trim().min(1).max(300),
  division: z.string().trim().min(1).max(100),
  educational_district: z.string().trim().min(1).max(200),
  governorate: z.string().trim().min(1).max(100),
})

const app = new Hono<AppEnv>()

app.get("/status", async (c) => {
  const db = c.get("db")
  const group = await db
    .selectFrom("application_groups")
    .select(["id", "name", "academic_year_label", "declaration_text"])
    .where("is_active", "=", 1)
    .executeTakeFirst()

  if (!group) {
    return c.json({ data: { accepting: false, alreadySubmitted: false, group: null } })
  }

  const cookie = getCookie(c, COOKIE_NAME)
  const alreadySubmitted = cookie === String(group.id)

  return c.json({
    data: {
      accepting: true,
      alreadySubmitted,
      group: {
        id: group.id,
        name: group.name,
        academic_year_label: group.academic_year_label,
        declaration_text: group.declaration_text,
      },
    },
  })
})

app.post("/", async (c) => {
  const db = c.get("db")

  const group = await db
    .selectFrom("application_groups")
    .select(["id", "name"])
    .where("is_active", "=", 1)
    .executeTakeFirst()
  if (!group) return c.json({ error: "APPLICATIONS_CLOSED" }, 403)

  const existingCookie = getCookie(c, COOKIE_NAME)
  if (existingCookie === String(group.id)) {
    return c.json({ error: "ALREADY_SUBMITTED" }, 409)
  }

  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    return c.json({ error: "Invalid form data" }, 400)
  }

  const turnstileToken = String(form.get("turnstile_token") ?? "")
  const remoteIp = c.req.header("CF-Connecting-IP") ?? null
  const turnstileOk = await verifyTurnstile(
    c.env.TURNSTILE_SECRET_KEY,
    turnstileToken,
    remoteIp,
  )
  if (!turnstileOk) return c.json({ error: "TURNSTILE_FAILED" }, 400)

  const fieldsRaw: Record<string, string> = {}
  for (const key of Object.keys(fieldsSchema.shape)) {
    const value = form.get(key)
    fieldsRaw[key] = typeof value === "string" ? value : ""
  }
  const parsed = fieldsSchema.safeParse(fieldsRaw)
  if (!parsed.success) {
    return c.json(
      { error: "INVALID_FIELDS", issues: parsed.error.issues },
      400,
    )
  }
  const fields = parsed.data

  const declarationAccepted = String(form.get("declaration_accepted") ?? "")
  if (declarationAccepted !== "true") {
    return c.json({ error: "DECLARATION_REQUIRED" }, 400)
  }

  const photo = form.get("photo")
  const certificate = form.get("certificate_file")
  if (!(photo instanceof File) || !(certificate instanceof File)) {
    return c.json({ error: "FILES_REQUIRED" }, 400)
  }
  if (photo.size === 0 || photo.size > PHOTO_MAX_BYTES) {
    return c.json({ error: "PHOTO_SIZE" }, 400)
  }
  if (certificate.size === 0 || certificate.size > CERT_MAX_BYTES) {
    return c.json({ error: "CERTIFICATE_SIZE" }, 400)
  }

  const imageKind = await detectImageKind(photo)
  if (!imageKind) return c.json({ error: "PHOTO_TYPE" }, 400)

  const certIsPdf = await isPdf(certificate)
  if (!certIsPdf) return c.json({ error: "CERTIFICATE_TYPE" }, 400)

  const dupe = await db
    .selectFrom("applications")
    .select("id")
    .where("group_id", "=", group.id)
    .where("national_id", "=", fields.national_id)
    .executeTakeFirst()
  if (dupe) return c.json({ error: "DUPLICATE_NATIONAL_ID" }, 409)

  const applicationId = crypto.randomUUID()
  const photoKey = `${group.id}/${applicationId}/photo.${IMAGE_EXT[imageKind]}`
  const certKey = `${group.id}/${applicationId}/certificate.pdf`
  const now = new Date().toISOString()

  try {
    await c.env.APP_FILES.put(photoKey, photo.stream(), {
      httpMetadata: { contentType: IMAGE_CONTENT_TYPE[imageKind] },
    })
    await c.env.APP_FILES.put(certKey, certificate.stream(), {
      httpMetadata: { contentType: "application/pdf" },
    })
  } catch (err) {
    await Promise.allSettled([
      c.env.APP_FILES.delete(photoKey),
      c.env.APP_FILES.delete(certKey),
    ])
    return c.json({ error: "UPLOAD_FAILED" }, 502)
  }

  try {
    const computedAge = ageOnNextOctober(fields.birthdate)
    if (computedAge === null) {
      await Promise.allSettled([
        c.env.APP_FILES.delete(photoKey),
        c.env.APP_FILES.delete(certKey),
      ])
      return c.json({ error: "INVALID_BIRTHDATE" }, 400)
    }
    await db
      .insertInto("applications")
      .values({
        id: applicationId,
        group_id: group.id,
        ...fields,
        age_october: String(computedAge),
        photo_key: photoKey,
        photo_content_type: IMAGE_CONTENT_TYPE[imageKind],
        photo_size: photo.size,
        certificate_key: certKey,
        certificate_size: certificate.size,
        declaration_accepted_at: now,
        submitter_ip: remoteIp,
        created_at: now,
      })
      .execute()
  } catch (err) {
    await Promise.allSettled([
      c.env.APP_FILES.delete(photoKey),
      c.env.APP_FILES.delete(certKey),
    ])
    if (
      err instanceof Error &&
      /UNIQUE constraint failed/i.test(err.message)
    ) {
      return c.json({ error: "DUPLICATE_NATIONAL_ID" }, 409)
    }
    return c.json({ error: "DB_FAILED" }, 500)
  }

  setCookie(c, COOKIE_NAME, String(group.id), {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  })

  return c.json({ data: { id: applicationId } }, 201)
})

export default app
