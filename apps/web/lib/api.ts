const API_URL = process.env.API_URL ?? "http://localhost:8787"

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

interface ListResponse {
  data: EventListItem[]
  meta: { total: number; page: number; limit: number }
}

interface DetailResponse {
  data: EventDetail
}

export async function getEvents(opts?: {
  sort?: "dateNewest" | "dateOldest" | "titleAsc" | "titleDesc"
  limit?: number
}): Promise<EventListItem[]> {
  const params = new URLSearchParams({
    sort: opts?.sort ?? "dateNewest",
    limit: String(opts?.limit ?? 50),
  })
  const res = await fetch(`${API_URL}/api/events?${params.toString()}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Failed to fetch events (${res.status})`)
  const json = (await res.json()) as ListResponse
  return json.data
}

export async function getEvent(id: number): Promise<EventDetail | null> {
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`)
  const json = (await res.json()) as DetailResponse
  return json.data
}
