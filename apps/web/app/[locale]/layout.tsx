import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Alexandria } from "next/font/google"
import { notFound } from "next/navigation"
import "@workspace/ui/globals.css"
import { DirectionProvider } from "@workspace/ui/components/direction"
import { cn } from "@workspace/ui/lib/utils"

import enMessages from "@/messages/en.json"
import arMessages from "@/messages/ar.json"
import { routing } from "@/i18n/routing"
import { env } from "@/lib/env"

const MESSAGES = { en: enMessages, ar: arMessages } as const

const fontArabic = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
})

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SITE_NAMES: Record<string, string> = {
  en: "STEM Program",
  ar: "برنامج ستيم",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata.home" })
  const siteName = SITE_NAMES[locale] ?? SITE_NAMES.en!

  const localeAlternates: Record<string, string> = {}
  for (const l of routing.locales) {
    localeAlternates[l] = `${SITE_URL}/${l}`
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: "%s",
    },
    description: t("description"),
    applicationName: siteName,
    alternates: {
      canonical: `/${locale}`,
      languages: localeAlternates,
    },
    openGraph: {
      type: "website",
      locale,
      url: `${SITE_URL}/${locale}`,
      siteName,
      title: t("title"),
      description: t("description"),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = MESSAGES[locale as keyof typeof MESSAGES]
  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontArabic.variable,
        locale === "ar" && fontArabic.className,
      )}
    >
      <body className="bg-main">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={dir}>
            {children}
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
