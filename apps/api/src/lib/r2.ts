import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"

const BUCKET_NAME = "cdn"

export function createS3Client(env: CloudflareBindings): S3Client {
  return new S3Client({
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
}

export async function deleteObjects(
  env: CloudflareBindings,
  keys: string[],
): Promise<void> {
  if (keys.length === 0) return
  const client = createS3Client(env)
  await Promise.all(
    keys.map((Key) =>
      client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key })),
    ),
  )
}

export { BUCKET_NAME }
