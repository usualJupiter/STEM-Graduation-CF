import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Fees from "@/components/programs/fees"
import Header from "@/components/programs/header"
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
      <Header />
      <Programs />
      <Fees />
    </main>
  )
}
