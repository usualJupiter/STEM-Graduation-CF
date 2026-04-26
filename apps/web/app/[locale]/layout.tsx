import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { Geist, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"
import { notFound } from "next/navigation"
import "@workspace/ui/globals.css"
import { DirectionProvider } from "@workspace/ui/components/direction"
import { routing } from "@/i18n/routing"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontArabic = localFont({
  src: [
    { path: "../../public/assets/fonts/KOSans-Thin.otf", weight: "100", style: "normal" },
    { path: "../../public/assets/fonts/KOSans-ExtraLight.otf", weight: "200", style: "normal" },
    { path: "../../public/assets/fonts/KOSans-Light.otf", weight: "300", style: "normal" },
    { path: "../../public/assets/fonts/KOSans-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/KOSans-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/KOSans-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/KOSans-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
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

  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        fontArabic.variable,
        locale === "ar" && fontArabic.className,
      )}
    >
      <body>
        <NextIntlClientProvider>
          <DirectionProvider dir={dir}>
            {children}
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
