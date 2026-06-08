import { API_URL } from "@/lib/api"
import { compressImage } from "@/lib/compress-image"

export type UploadPrefix = "events" | "capstones" | "gallery"

const MAX_BYTES = 1024 * 1024
const ACCEPTED = ["image/png", "image/jpeg"] as const

export const ACCEPTED_FILE_TYPES = ACCEPTED
export const ACCEPT_ATTR = ACCEPTED.join(",")

export function isAcceptedFile(file: File): boolean {
  return (ACCEPTED as readonly string[]).includes(file.type)
}

export interface UploadResult {
  key: string
  size: number
}

interface UploadResponse {
  data: { items: UploadResult[] }
}

export async function uploadImage(
  file: File,
  prefix: UploadPrefix,
): Promise<UploadResult> {
  const [result] = await uploadImages([file], prefix)
  return result!
}

export async function uploadImages(
  files: File[],
  prefix: UploadPrefix,
): Promise<UploadResult[]> {
  if (files.length === 0) return []
  for (const f of files) {
    if (!isAcceptedFile(f)) {
      throw new Error("Only PNG or JPEG files are accepted")
    }
  }

  const blobs = await Promise.all(files.map((f) => compressImage(f, MAX_BYTES)))

  const form = new FormData()
  form.append("prefix", prefix)
  blobs.forEach((b, i) => form.append("files", b, `${i}.webp`))

  // Multipart upload through the API — it writes to R2 via the bucket binding,
  // so dev hits local R2 and prod hits prod R2. credentials: "include" sends
  // the auth cookie; Content-Type is left unset so the browser adds the boundary.
  const res = await fetch(`${API_URL}/api/admin/uploads`, {
    method: "POST",
    credentials: "include",
    body: form,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(body?.error ?? `Upload failed (${res.status})`)
  }

  const json = (await res.json()) as UploadResponse
  return json.data.items
}
