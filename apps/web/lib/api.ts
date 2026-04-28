const API_URL = process.env.API_URL ?? "http://localhost:8787"

async function fetchJson<T>(path: string, label: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Failed to fetch ${label} (${res.status})`)
  const json = (await res.json()) as { data: T }
  return json.data
}

export interface EventListItem {
  id: number
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  event_date: string
  event_time: string
  card_photo_url: string | null
  created_at: string
}

export interface EventDetail extends EventListItem {
  photos: Array<{ id: number; position: number; url: string }>
}

export async function getEvents(opts?: {
  sort?: "dateNewest" | "dateOldest" | "titleAsc" | "titleDesc"
  limit?: number
}): Promise<EventListItem[]> {
  const params = new URLSearchParams({
    sort: opts?.sort ?? "dateNewest",
    limit: String(opts?.limit ?? 50),
  })
  return fetchJson<EventListItem[]>(`/api/events?${params}`, "events")
}

export async function getEvent(id: number): Promise<EventDetail | null> {
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`)
  return ((await res.json()) as { data: EventDetail }).data
}

export interface GalleryPhoto {
  id: number
  url: string
  created_at: string
}

export async function getGalleryPhotos(opts?: {
  limit?: number
}): Promise<GalleryPhoto[]> {
  const params = new URLSearchParams({
    limit: String(opts?.limit ?? 50),
  })
  return fetchJson<GalleryPhoto[]>(`/api/gallery?${params}`, "gallery")
}

export interface ScheduleLevel {
  level: number
  drive_url: string
}

export async function getSchedules(): Promise<ScheduleLevel[]> {
  return fetchJson<ScheduleLevel[]>(`/api/schedules`, "schedules")
}
