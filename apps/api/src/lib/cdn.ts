/**
 * Build a public CDN URL from a stored R2 object key.
 * Trims trailing slashes from the base and leading slashes from the key so
 * callers don't have to worry about how either was formatted.
 */
export function cdnUrl(cdn: string, key: string): string
export function cdnUrl(cdn: string, key: null): null
export function cdnUrl(cdn: string, key: string | null): string | null
export function cdnUrl(cdn: string, key: string | null): string | null {
  if (key === null) return null
  return `${cdn.replace(/\/$/, "")}/${key.replace(/^\//, "")}`
}
