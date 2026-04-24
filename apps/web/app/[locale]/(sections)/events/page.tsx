import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Header from "@/components/events/header"
import Events from "@/components/events/events"

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

export default function EventsPage() {
  return (
    <main>
      <Header />
      <Events />
    </main>
  )
}
