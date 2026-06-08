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
