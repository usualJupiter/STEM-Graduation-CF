import { S3Client } from "@aws-sdk/client-s3"

const BUCKET_NAME = "cdn"

// Workers reuses isolates across requests; reuse the S3Client too.
// Only used for presigning PUT URLs — bulk delete uses the native R2 binding.
let cachedClient: S3Client | undefined

export function createS3Client(env: CloudflareBindings): S3Client {
  if (cachedClient) return cachedClient
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    // R2 doesn't accept the AWS SDK's auto-injected CRC32 checksum. Skip it.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  })
  return cachedClient
}

// Deletes objects via the R2 binding's native batch delete (one subrequest)
// rather than fanning out N S3 SDK calls. Logs rejection so orphans are
// detectable in observability — but doesn't throw, so callers can keep their
// best-effort cleanup semantics.
export async function deleteObjects(
  env: CloudflareBindings,
  keys: string[],
): Promise<void> {
  if (keys.length === 0) return
  try {
    await env.PUBLIC_MEDIA.delete(keys)
  } catch (err) {
    console.error("[r2] bulk delete failed", { count: keys.length, err })
  }
}

export { BUCKET_NAME }
