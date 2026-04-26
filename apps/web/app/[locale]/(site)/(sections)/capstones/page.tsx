import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Header from "@/components/capstones/header"
import Levels from "@/components/capstones/levels"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.capstones" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function CapstonesPage() {
  return (
    <main>
      <Header />
      <Levels />
    </main>
  )
}
