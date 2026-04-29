import { fetchJson } from "@/lib/api"
import { compressImage } from "@/lib/compress-image"

const MAX_BYTES = 1024 * 1024
const CONTENT_TYPE = "image/webp"

export type CapstoneUploadKind =
  | "card"
  | "gallery"
  | "material"
  | "producers"

interface SignResponse {
  data: { uploadUrl: string; key: string }
}

export async function uploadCapstoneImage(
  file: File,
  kind: CapstoneUploadKind,
): Promise<string> {
  const blob = await compressImage(file, MAX_BYTES)

  const sign = await fetchJson<SignResponse>(
    "/api/admin/uploads/capstones/sign",
    {
      method: "POST",
      body: JSON.stringify({
        contentType: CONTENT_TYPE,
        kind,
        fileSize: blob.size,
      }),
    },
  )

  const res = await fetch(sign.data.uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": CONTENT_TYPE },
  })
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`)
  }

  return sign.data.key
}
