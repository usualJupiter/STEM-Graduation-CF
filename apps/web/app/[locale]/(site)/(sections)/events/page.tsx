import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Events from "@/components/events/events"
import { PageHeader } from "@/components/page-header"
import { getEvents } from "@/lib/api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.events" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function EventsPage() {
  const items = await getEvents({ sort: "dateNewest", limit: 50 })
  return (
    <main>
      <PageHeader
        namespace="EventsHeader"
        imageSrc="https://cdn.stem-program.com/assets/assets_events.avif"
      />
      <Events items={items} />
    </main>
  )
}
