import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Gallery from "@/components/gallery/gallery"
import { PageHeader } from "@/components/page-header"
import { getGalleryPhotos } from "@/lib/api"

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

export default async function GalleryPage() {
  const photos = await getGalleryPhotos({ limit: 500 }).catch(() => [])
  const images = photos.map((p) => p.url)

  return (
    <main>
      <PageHeader
        namespace="GalleryHeader"
        imageSrc="https://cdn.stem-program.com/assets/assets_life.avif"
      />
      <Gallery images={images} />
    </main>
  )
}
