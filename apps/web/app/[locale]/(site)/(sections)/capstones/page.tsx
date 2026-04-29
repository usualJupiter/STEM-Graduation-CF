import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Levels from "@/components/capstones/levels"
import { PageHeader } from "@/components/page-header"
import { getCapstones } from "@/lib/api"

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

export default async function CapstonesPage() {
  const items = await getCapstones({ limit: 150 })
  return (
    <main>
      <PageHeader
        namespace="CapstonesHeader"
        imageSrc="https://cdn.stem-program.com/assets/assets_capstone.avif"
      />
      <Levels items={items} />
    </main>
  )
}
