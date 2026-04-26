import type { Metadata } from "next"
import { notFound } from "next/navigation"

import Header from "@/components/events/id/header"
import Event from "@/components/events/id/event"
import { getEvent } from "@/lib/api"
import { formatEventDate } from "@/lib/format"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) return {}
  const event = await getEvent(numericId)
  if (!event) return {}
  const title =
    locale === "ar"
      ? event.title_ar || event.title_en
      : event.title_en || event.title_ar
  const description =
    locale === "ar"
      ? event.description_ar || event.description_en
      : event.description_en || event.description_ar
  return { title, description }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) notFound()

  const event = await getEvent(numericId)
  if (!event) notFound()

  const title =
    locale === "ar"
      ? event.title_ar || event.title_en
      : event.title_en || event.title_ar
  const description =
    locale === "ar"
      ? event.description_ar || event.description_en
      : event.description_en || event.description_ar

  return (
    <div>
      <Header title={title} imageUrl={event.card_photo_url} />
      <Event
        title={title}
        description={description}
        date={formatEventDate(event.event_date, locale)}
        time={event.event_time}
        images={event.photos.map((p) => ({ src: p.url, alt: title }))}
      />
    </div>
  )
}
