import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Lectures from "@/components/schedules/lectures"
import { PageHeader } from "@/components/page-header"
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
      <PageHeader
        namespace="SchedulesHeader"
        imageSrc="https://cdn.stem-program.com/assets/assets_lectures.avif"
      />
      <Lectures levels={levels} />
    </main>
  )
}
