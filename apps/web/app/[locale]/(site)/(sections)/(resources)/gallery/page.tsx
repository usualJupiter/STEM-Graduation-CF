import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Header from "@/components/gallery/header"
import Gallery from "@/components/gallery/gallery"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.gallery" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function GalleryPage() {
  return (
    <main>
      <Header />
      <Gallery />
    </main>
  )
}
