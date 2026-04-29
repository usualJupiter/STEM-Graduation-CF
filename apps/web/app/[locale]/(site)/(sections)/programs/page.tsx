import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Fees from "@/components/programs/fees"
import { PageHeader } from "@/components/page-header"
import Programs from "@/components/programs/programs"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.programs" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function ProgramsPage() {
  return (
    <main className="min-h-svh">
      <PageHeader
        namespace="ProgramsHeader"
        imageSrc="https://cdn.stem-program.com/assets/assets_programs.avif"
      />
      <Programs />
      <Fees />
    </main>
  )
}
