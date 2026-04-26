import { NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import ApplyFooter from "@/components/apply/footer"
import ApplyHeader from "@/components/apply/header"
import { DirectionProvider } from "@workspace/ui/components/direction"

export default async function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  setRequestLocale("ar")
  const messages = (await import("@/messages/ar.json")).default

  return (
    <NextIntlClientProvider locale="ar" messages={messages}>
      <DirectionProvider dir="rtl">
        <div
          lang="ar"
          dir="rtl"
          className="flex min-h-svh flex-col bg-main text-main-foreground"
          style={{ fontFamily: "var(--font-arabic)" }}
        >
          <ApplyHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <ApplyFooter />
        </div>
      </DirectionProvider>
    </NextIntlClientProvider>
  )
}
