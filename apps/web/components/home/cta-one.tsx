import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"

const PROGRAM_KEYS = [
  "physics",
  "chemistry",
  "biology",
  "geology",
  "mathematics",
] as const

type ProgramKey = (typeof PROGRAM_KEYS)[number]

interface QuickLink {
  key: ProgramKey
  href: string
}

interface CtaOneProps {
  applyHref?: string
  programsHref?: string
  quickLinks?: QuickLink[]
}

const DEFAULT_QUICK_LINKS: QuickLink[] = PROGRAM_KEYS.map((key) => ({
  key,
  href: "/programs",
}))

const CARD_CLASSES = [
  "bg-web-card-1 text-main [a]:hover:bg-web-card-1/90",
  "bg-web-card-2 text-main [a]:hover:bg-web-card-2/90",
  "bg-web-card-3 text-main [a]:hover:bg-web-card-3/90",
  "bg-web-card-4 text-main [a]:hover:bg-web-card-4/90",
] as const

export default function CtaOne({
  applyHref = "/apply",
  programsHref = "/programs",
  quickLinks = DEFAULT_QUICK_LINKS,
}: CtaOneProps) {
  const t = useTranslations("CtaOne")

  return (
    <section className="w-full bg-secondry-web">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 py-12 md:flex-row md:items-stretch md:justify-between md:gap-16 md:px-16 md:py-24">
        <div className="flex max-w-[700px] flex-col gap-10">
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-main-foreground md:text-4xl">
              {t("heading")}
            </h2>
            <p className="whitespace-pre-line text-base text-main-foreground/80 md:text-lg md:leading-8">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Button variant="transparent-outline" asChild className="font-bold">
              <Link href={applyHref}>
                {t("apply")}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </Link>
            </Button>
            <Button variant="transparent-outline" asChild className="font-bold">
              <Link href={programsHref}>
                {t("browsePrograms")}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex w-full max-w-xl flex-col gap-2">
          <p className="mb-1 text-sm font-bold text-main-foreground/80">
            {t("quickLinks")}
          </p>
          <ul className="flex flex-col gap-2 md:flex-1">
            {quickLinks.map((link, i) => (
              <li key={link.key}>
                <Button
                  asChild
                  className={cn(
                    "w-full justify-start font-bold",
                    CARD_CLASSES[i % CARD_CLASSES.length]
                  )}
                >
                  <Link href={link.href}>
                    <ArrowRight aria-hidden className="rtl:rotate-180" />
                    {t(`programs.${link.key}`)}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
