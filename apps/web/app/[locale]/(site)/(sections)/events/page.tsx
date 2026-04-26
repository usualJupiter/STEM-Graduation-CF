import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Header from "@/components/events/header"
import Events from "@/components/events/events"
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
      <Header />
      <Events items={items} />
    </main>
  )
}
