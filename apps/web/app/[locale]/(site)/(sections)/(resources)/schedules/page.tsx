import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Header from "@/components/schedules/header"
import Lectures from "@/components/schedules/lectures"

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

export default function SchedulesPage() {
  return (
    <main>
      <Header />
      <Lectures />
    </main>
  )
}
