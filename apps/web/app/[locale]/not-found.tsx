import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@workspace/ui/components/button"

import { Link } from "@/i18n/navigation"

export default async function NotFoundPage() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "NotFound" })

  return (
    <section className="relative w-full overflow-hidden bg-secondry-web">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none bg-[url('https://cdn.stem-program.com/assets/capstone-header-bg.svg')] bg-[length:100%_100%] bg-no-repeat"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-16 sm:px-8 md:px-16">
        <p className="text-base font-medium text-primary-foreground/80 sm:text-lg">
          {t("tagline")}
        </p>
        <h1 className="text-center text-8xl font-semibold tracking-tight text-primary-foreground [text-shadow:8px_6px_0_rgba(0,0,0,0.5)] sm:text-9xl md:text-[200px] md:leading-[1] lg:text-[240px]">
          {t("heading")}
        </h1>
        <p className="max-w-2xl text-center text-xl text-primary-foreground/80 sm:text-2xl">
          {t("description")}
        </p>
        <Button
          asChild
          className="h-12 bg-default-web px-8 text-base font-semibold text-main [a]:hover:bg-default-web/90"
        >
          <Link href="/">{t("buttonLabel")}</Link>
        </Button>
      </div>
    </section>
  )
}
