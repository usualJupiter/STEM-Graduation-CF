"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { formatEventDate } from "@/lib/format"
import type { EventListItem } from "@/lib/api"

interface EventsProps {
  items: EventListItem[]
}

export default function Events({ items }: EventsProps) {
  const t = useTranslations("EventsList")
  const locale = useLocale()

  if (items.length === 0) {
    return (
      <div className="flex w-full items-center justify-center bg-background px-4 py-16">
        <p className="text-base text-muted-foreground">{t("empty")}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-center bg-background px-4 py-10 md:px-8 lg:py-16">
      <div className="grid w-full max-w-[1294px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-[84px]">
        {items.map((event) => {
          const title =
            locale === "ar"
              ? event.title_ar || event.title_en
              : event.title_en || event.title_ar
          const description =
            locale === "ar"
              ? event.description_ar || event.description_en
              : event.description_en || event.description_ar
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group flex flex-col gap-4"
            >
              {event.card_photo_url && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                  <Image
                    src={event.card_photo_url}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatEventDate(event.event_date, locale)}
                  </span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {event.event_time}
                  </span>
                </div>
                <h3 className="text-base font-semibold leading-6 text-foreground">
                  {title}
                </h3>
                <p className="line-clamp-3 text-sm leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
