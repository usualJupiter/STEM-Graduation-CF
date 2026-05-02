export type ImageKind = "png" | "jpeg"

export async function detectImageKind(blob: Blob): Promise<ImageKind | null> {
  const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer())
  if (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47
  ) {
    return "png"
  }
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return "jpeg"
  }
  return null
}

export async function isPdf(blob: Blob): Promise<boolean> {
  const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer())
  return (
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46 &&
    head[4] === 0x2d
  )
}

export const IMAGE_EXT: Record<ImageKind, string> = {
  png: "png",
  jpeg: "jpg",
}

export const IMAGE_CONTENT_TYPE: Record<ImageKind, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
}
