// Compress a user-picked image to a WebP Blob whose size is at most `maxBytes`.
// Resize to fit MAX_DIM, then step the quality down if the result is still too big.
// Throws if the browser can't encode WebP or no quality fits the cap.

const MAX_DIM = 1920
const QUALITY_LADDER = [0.85, 0.7, 0.55, 0.4, 0.25]

export async function compressImage(
  file: File,
  maxBytes: number = 1024 * 1024,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  let width = bitmap.width
  let height = bitmap.height
  const longest = Math.max(width, height)
  if (longest > MAX_DIM) {
    const scale = MAX_DIM / longest
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    throw new Error("Could not get canvas context")
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let last: Blob | null = null
  for (const quality of QUALITY_LADDER) {
    const blob = await encode(canvas, quality)
    last = blob
    if (blob.size <= maxBytes) return blob
  }

  const sizeKb = last ? Math.round(last.size / 1024) : 0
  throw new Error(
    `Image too large after compression (${sizeKb} KB). Try a smaller image.`,
  )
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Browsers that can't encode the requested type fall back to PNG silently.
        // Reject explicitly so we don't store a PNG with the wrong content-type.
        if (!blob || blob.type !== "image/webp") {
          reject(new Error("This browser cannot encode WebP"))
          return
        }
        resolve(blob)
      },
      "image/webp",
      quality,
    )
  })
}
