"use client"

import { useTranslations } from "next-intl"

import { HoverExpand, type HoverExpandItem } from "./hover-expand"

interface EventProps {
  title: string
  description: string
  date: string
  time: string
  images: HoverExpandItem[]
}

export default function Event({
  title,
  description,
  date,
  time,
  images,
}: EventProps) {
  const t = useTranslations("EventDetail")
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-10 bg-white px-6 py-10 lg:flex-row lg:px-20 lg:py-10">
      <div className="flex min-w-0 max-w-2xl flex-col gap-10">
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold leading-none tracking-tight text-foreground">
            {title}
          </h2>
          <p className="whitespace-pre-line text-lg leading-8 text-foreground/80">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-lg leading-8 text-foreground/80">
            {t("date")}: {date}
            <br />
            {t("time")}: {time}
          </p>
        </div>
      </div>
      {images.length > 0 && (
        <div className="w-full max-w-[380px] shrink-0">
          <HoverExpand items={images} />
        </div>
      )}
    </section>
  )
}
