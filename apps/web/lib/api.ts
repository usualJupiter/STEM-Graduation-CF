const API_URL = process.env.API_URL ?? "http://localhost:8787"

async function fetchJson<T>(path: string, label: string): Promise<T> {
  const url = `${API_URL}${path}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `Failed to fetch ${label} (${res.status}) ${url}${body ? ` :: ${body.slice(0, 200)}` : ""}`,
    )
  }
  const json = (await res.json()) as { data: T }
  return json.data
}

async function fetchJsonOrNull<T>(
  path: string,
  label: string,
): Promise<T | null> {
  const url = `${API_URL}${path}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `Failed to fetch ${label} (${res.status}) ${url}${body ? ` :: ${body.slice(0, 200)}` : ""}`,
    )
  }
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

export function getEvent(id: number): Promise<EventDetail | null> {
  return fetchJsonOrNull<EventDetail>(`/api/events/${id}`, "event")
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

export interface CapstoneListItem {
  id: number
  slug: string
  title_en: string
  title_ar: string
  full_name_en: string
  full_name_ar: string
  level: number
  semester: "first" | "second"
  card_photo_url: string | null
  created_at: string
}

export interface CapstonePerson {
  id: number
  name_en: string
  name_ar: string
  position: number
}

export interface CapstoneMaterial {
  id: number
  name_en: string
  name_ar: string
  photo_url: string | null
  position: number
}

export interface CapstonePhoto {
  id: number
  url: string
  position: number
}

export interface CapstoneDetail {
  id: number
  slug: string
  title_en: string
  title_ar: string
  full_name_en: string
  full_name_ar: string
  level: number
  semester: "first" | "second"
  abstract_en: string
  abstract_ar: string
  introduction_en: string
  introduction_ar: string
  methodology_en: string
  methodology_ar: string
  analysis_en: string
  analysis_ar: string
  conclusion_en: string
  conclusion_ar: string
  recommendations_en: string
  recommendations_ar: string
  card_photo_url: string | null
  producers_photo_url: string | null
  poster_link: string | null
  portfolio_link: string | null
  presentation_link: string | null
  students: CapstonePerson[]
  supervisors: CapstonePerson[]
  materials: CapstoneMaterial[]
  photos: CapstonePhoto[]
  created_at: string
  updated_at: string
}

export async function getCapstones(opts?: {
  level?: number
  sort?: "dateNewest" | "dateOldest" | "nameAsc" | "nameDesc"
  limit?: number
}): Promise<CapstoneListItem[]> {
  const params = new URLSearchParams({
    sort: opts?.sort ?? "dateNewest",
    limit: String(opts?.limit ?? 50),
  })
  if (opts?.level) params.set("level", String(opts.level))
  return fetchJson<CapstoneListItem[]>(
    `/api/capstones?${params}`,
    "capstones",
  )
}

export function getCapstone(slug: string): Promise<CapstoneDetail | null> {
  return fetchJsonOrNull<CapstoneDetail>(`/api/capstones/${slug}`, "capstone")
}
