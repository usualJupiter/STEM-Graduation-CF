import { z } from "zod"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"

export interface ApplicationStatus {
  accepting: boolean
  alreadySubmitted: boolean
  group: {
    id: number
    name: string
    academic_year_label: string
    declaration_text: string
  } | null
}

export async function getApplicationStatus(): Promise<ApplicationStatus> {
  const res = await fetch(`${API_URL}/api/applications/status`, {
    credentials: "include",
    cache: "no-store",
  })
  if (!res.ok) throw new Error("status_failed")
  const json = (await res.json()) as { data: ApplicationStatus }
  return json.data
}

const PHOTO_MAX_BYTES = 1 * 1024 * 1024
const CERT_MAX_BYTES = 5 * 1024 * 1024
const PHOTO_TYPES = ["image/png", "image/jpeg"] as const
const PDF_TYPE = "application/pdf"

const requiredString = (msg = "هذا الحقل مطلوب") =>
  z.string().trim().min(1, msg)

const DDMMYYYY = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/
const MMYYYY = /^(0[1-9]|1[0-2])\/(\d{4})$/
const HOME_PHONE = /^088\d{7}$/
const EG_MOBILE = /^01[0125]\d{8}$/

export const studentSchema = z.object({
  name: requiredString(),
  nationality: requiredString(),
  religion: requiredString(),
  residence: requiredString(),
  home_phone: z
    .string()
    .trim()
    .regex(HOME_PHONE, "رقم هاتف المنزل يجب أن يكون 088 يليه 7 أرقام"),
  mobile: z.string().trim().regex(EG_MOBILE, "رقم محمول مصري غير صحيح"),
  birthdate: z
    .string()
    .trim()
    .regex(DDMMYYYY, "صيغة تاريخ الميلاد يجب أن تكون DD/MM/YYYY"),
  birthplace: requiredString(),
  national_id: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "الرقم القومي يجب أن يكون 14 رقمًا"),
  id_issuing_authority: requiredString(),
  id_issue_date: z
    .string()
    .trim()
    .regex(MMYYYY, "صيغة تاريخ الإصدار يجب أن تكون MM/YYYY"),
  guardian_name: requiredString(),
  guardian_job: requiredString(),
  guardian_address: requiredString(),
  guardian_mobile: z
    .string()
    .trim()
    .regex(EG_MOBILE, "رقم محمول مصري غير صحيح"),
})

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}

export function formatDateDDMMYYYY(value: string): string {
  const d = digitsOnly(value).slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

export function formatDateMMYYYY(value: string): string {
  const d = digitsOnly(value).slice(0, 6)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}/${d.slice(2)}`
}

export function ageOnNextOctober(birthdate: string): number | null {
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

export const certSchema = z.object({
  certificate: requiredString(),
  graduation_year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "سنة التخرج يجب أن تكون 4 أرقام"),
  total_grades: requiredString(),
  first_language: requiredString(),
  second_language: requiredString(),
  school: requiredString(),
  division: requiredString(),
  educational_district: requiredString(),
  governorate: requiredString(),
})

export const filesSchema = z.object({
  photo: z
    .instanceof(File, { message: "الرجاء اختيار صورة شخصية" })
    .refine(
      (f) => (PHOTO_TYPES as readonly string[]).includes(f.type),
      "الصورة يجب أن تكون PNG أو JPEG",
    )
    .refine((f) => f.size > 0 && f.size <= PHOTO_MAX_BYTES, "حجم الصورة يجب أن يكون أقل من 1 ميجابايت"),
  certificate_file: z
    .instanceof(File, { message: "الرجاء رفع شهادة الثانوية" })
    .refine((f) => f.type === PDF_TYPE, "ملف الشهادة يجب أن يكون PDF")
    .refine((f) => f.size > 0 && f.size <= CERT_MAX_BYTES, "حجم الملف يجب أن يكون أقل من 5 ميجابايت"),
})

export const fullSchema = z.object({
  ...studentSchema.shape,
  ...certSchema.shape,
  ...filesSchema.shape,
})

export type StudentValues = z.infer<typeof studentSchema>
export type CertValues = z.infer<typeof certSchema>
export type FilesValues = z.infer<typeof filesSchema>
export type ApplyValues = z.infer<typeof fullSchema>

export const APPLY_DRAFT_KEY = (groupId: number) =>
  `apply.draft.v1.${groupId}`

const ERROR_MESSAGES: Record<string, string> = {
  APPLICATIONS_CLOSED: "التقديم مغلق حاليًا",
  ALREADY_SUBMITTED: "تم تقديم طلبك بالفعل",
  DUPLICATE_NATIONAL_ID: "تم تقديم طلبك بالفعل",
  TURNSTILE_FAILED: "تعذّر التحقق، يرجى تحديث الصفحة والمحاولة مرة أخرى",
  PHOTO_TYPE: "صيغة الصورة غير مدعومة (PNG أو JPEG فقط)",
  PHOTO_SIZE: "حجم الصورة يجب أن يكون أقل من 1 ميجابايت",
  CERTIFICATE_TYPE: "ملف الشهادة يجب أن يكون PDF",
  CERTIFICATE_SIZE: "حجم ملف الشهادة يجب أن يكون أقل من 5 ميجابايت",
  DECLARATION_REQUIRED: "يجب الموافقة على الإقرار",
  INVALID_FIELDS: "بعض البيانات غير صحيحة، يرجى مراجعة الحقول",
  FILES_REQUIRED: "الملفات المطلوبة غير مرفقة",
  UPLOAD_FAILED: "تعذّر رفع الملفات، يرجى المحاولة مرة أخرى",
  DB_FAILED: "حدث خطأ، يرجى المحاولة مرة أخرى لاحقًا",
}

export function applyErrorMessage(code: string | undefined): string {
  return ERROR_MESSAGES[code ?? ""] ?? "حدث خطأ غير متوقع"
}

export interface SubmitResult {
  ok: boolean
  errorCode?: string
  applicationId?: string
}

export async function submitApplication(
  values: ApplyValues,
  declarationAccepted: boolean,
  turnstileToken: string,
): Promise<SubmitResult> {
  const form = new FormData()
  for (const [key, val] of Object.entries(values)) {
    if (val instanceof File) form.append(key, val)
    else if (val !== undefined && val !== null) form.append(key, String(val))
  }
  form.set("declaration_accepted", String(declarationAccepted))
  form.set("turnstile_token", turnstileToken)

  const res = await fetch(`${API_URL}/api/applications`, {
    method: "POST",
    body: form,
    credentials: "include",
  })
  const json = (await res.json().catch(() => null)) as
    | { error?: string; data?: { id: string } }
    | null
  if (res.ok && json?.data?.id) {
    return { ok: true, applicationId: json.data.id }
  }
  return { ok: false, errorCode: json?.error }
}
