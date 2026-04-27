import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Header from "@/components/schedules/header"
import Lectures from "@/components/schedules/lectures"
import { getSchedules } from "@/lib/api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.schedules" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function SchedulesPage() {
  const levels = await getSchedules().catch(() => [])

  return (
    <main>
      <Header />
      <Lectures levels={levels} />
    </main>
  )
}
