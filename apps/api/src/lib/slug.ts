// Strip Unicode combining diacritical marks (U+0300..U+036F) after NFKD,
// then squash anything non-[a-z0-9] into hyphens.
const COMBINING_MARKS = /[̀-ͯ]/g

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base || "capstone"
}
