import { fetchJson } from "@/lib/api"
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

interface SignResponse {
  data: { items: { uploadUrl: string; key: string }[] }
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

  const sign = await fetchJson<SignResponse>("/api/admin/uploads/sign", {
    method: "POST",
    body: JSON.stringify({
      prefix,
      files: blobs.map((b) => ({ size: b.size })),
    }),
  })

  await Promise.all(
    sign.data.items.map(async (item, i) => {
      const res = await fetch(item.uploadUrl, {
        method: "PUT",
        body: blobs[i]!,
        headers: { "Content-Type": "image/webp" },
      })
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
    }),
  )

  return sign.data.items.map((item, i) => ({
    key: item.key,
    size: blobs[i]!.size,
  }))
}
