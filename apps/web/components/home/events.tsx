import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"

const EVENT_KEYS = [
  {
    key: "sustainability",
    colSpan: "md:col-span-2",
    borderClass: "border-yellow-500",
  },
  {
    key: "placeholder1",
    colSpan: "md:col-span-1",
    borderClass: "border-defult-web",
  },
  {
    key: "placeholder2",
    colSpan: "md:col-span-1",
    borderClass: "border-yellow-500",
  },
  {
    key: "newcomers",
    colSpan: "md:col-span-2",
    borderClass: "border-defult-web",
  },
] as const

interface EventsProps {
  className?: string
  seeAllHref?: string
}

export default function Events({
  className,
  seeAllHref = "/events",
}: EventsProps) {
  const t = useTranslations("Events")

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center bg-web-fourth py-16 md:py-24",
        className
      )}
    >
      <div className="w-full max-w-7xl px-6">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          <div className="flex max-w-xl flex-col items-center gap-5 text-center">
            <Link
              href={seeAllHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-black bg-white px-3 py-1 text-sm font-medium text-black shadow-sm transition-colors hover:bg-black/5"
            >
              <span className="size-2 shrink-0 rounded-full bg-green-500" />
              {t("tagline")}
              <ArrowUpRight aria-hidden className="shrink-0 rtl:-scale-x-100" />
            </Link>
            <h2 className="text-3xl font-semibold tracking-tight text-black md:text-5xl md:leading-[48px]">
              {t("heading")}
            </h2>
            <p className="text-base text-black/70 md:text-lg md:leading-8">
              {t("description")}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
            {EVENT_KEYS.map((event) => (
              <article
                key={event.key}
                className={cn(
                  "flex flex-col overflow-hidden border-[8px] bg-white shadow-sm",
                  event.colSpan,
                  event.borderClass
                )}
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src="https://ui.shadcn.com/placeholder.svg"
                    alt={t(`items.${event.key}.title`)}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-2 p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-black md:text-2xl md:leading-8">
                    {t(`items.${event.key}.title`)}
                  </h3>
                  <p className="text-sm text-black/70 md:text-base md:leading-6">
                    {t(`items.${event.key}.description`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
