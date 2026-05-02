import { API_URL } from "@/lib/api"

export async function downloadAuthed(path: string, fallbackName: string) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  const cd = res.headers.get("content-disposition") ?? ""
  const m = /filename="?([^"]+)"?/i.exec(cd)
  const name = m?.[1] ?? fallbackName
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
