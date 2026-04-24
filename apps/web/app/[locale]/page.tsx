import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import Aword from "@/components/home/word"
import CapstoneShow from "@/components/home/capstone-showcase"
import CtaOne from "@/components/home/cta-one"
import Events from "@/components/home/events"
import Hero from "@/components/home/hero"
import Life from "@/components/home/life"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.home" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function Home() {
  return (
    <main className="min-h-svh">
      <Hero />
      <CtaOne />
      <Life />
      <CapstoneShow />
      <Events />
      <Aword />
    </main>
  )
}
