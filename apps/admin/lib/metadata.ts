import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

type LocaleParams = { params: Promise<{ locale: string }> }

export function buildMetadata(key: string) {
  return async function generateMetadata({
    params,
  }: LocaleParams): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Metadata" })
    return { title: t(key) }
  }
}
