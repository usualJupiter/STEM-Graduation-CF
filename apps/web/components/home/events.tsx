"use client"

import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"

import { BrushFrame } from "@/components/brush-frame"
import { Link } from "@/i18n/navigation"
import type { EventListItem } from "@/lib/api"

const SLOTS = [
  {
    cardClass: "md:row-span-2",
    borderClass: "border-yellow-500",
    overlayClass: "bg-yellow-500",
    brushVariant: "secondary" as const,
  },
  {
    cardClass: "",
    borderClass: "border-defult-web",
    overlayClass: "bg-defult-web",
    brushVariant: "tertiary" as const,
  },
  {
    cardClass: "",
    borderClass: "border-pink-500",
    overlayClass: "bg-pink-500",
    brushVariant: "tertiary" as const,
  },
] as const

interface EventsProps {
  items: EventListItem[]
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export default function Events({ items }: EventsProps) {
  const t = useTranslations("Events")
  const locale = useLocale()
  const visible = items.slice(0, 3)
  const pick = (ar: string, en: string) =>
    locale === "ar" ? ar || en : en || ar

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={container}
      className="flex w-full flex-col items-center bg-web-fourth py-16 md:py-24"
    >
      <div className="w-full max-w-7xl px-6">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          <div className="flex max-w-xl flex-col items-center gap-5 text-center">
            <motion.div variants={fadeUp}>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 rounded-full border border-black bg-white px-3 py-1 text-sm font-medium text-black shadow-sm transition-colors hover:bg-black/5"
              >
                <span className="size-2 shrink-0 rounded-full bg-green-500" />
                {t("tagline")}
                <ArrowUpRight aria-hidden className="shrink-0 rtl:-scale-x-100" />
              </Link>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-semibold tracking-tight text-black md:text-5xl md:leading-[48px]"
            >
              {t("heading")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-base text-black/70 md:text-lg md:leading-8"
            >
              {t("description")}
            </motion.p>
          </div>

          {visible.length > 0 && (
            <motion.div
              variants={gridContainer}
              className="grid w-full grid-cols-1 gap-3 md:grid-cols-[2fr_1fr] md:grid-rows-2"
            >
              {visible.map((event, idx) => {
                const slot = SLOTS[idx]!
                const isLarge = idx === 0
                const title = pick(event.title_ar, event.title_en)
                const description = pick(
                  event.description_ar,
                  event.description_en,
                )
                return (
                  <motion.article
                    key={event.id}
                    variants={fadeUp}
                    className={cn(
                      "group relative flex flex-col overflow-hidden border-[8px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-black/40",
                      slot.cardClass,
                      slot.borderClass,
                    )}
                  >
                    <Link
                      href={`/events/${event.id}`}
                      aria-label={title}
                      className="absolute inset-0 z-20"
                    />
                    <BrushFrame
                      variant={slot.brushVariant}
                      className={cn("z-10", isLarge && "md:aspect-auto md:flex-1")}
                    >
                      {event.card_photo_url && (
                        <Image
                          src={event.card_photo_url}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes={
                            isLarge
                              ? "(min-width: 768px) 66vw, 100vw"
                              : "(min-width: 768px) 33vw, 100vw"
                          }
                          unoptimized
                        />
                      )}
                    </BrushFrame>
                    <div className="relative z-10 flex flex-col gap-2 p-6">
                      <h3 className="text-xl font-semibold tracking-tight text-black md:text-2xl md:leading-8">
                        {title}
                      </h3>
                      <p className="line-clamp-3 text-sm text-black/70 md:text-base md:leading-6">
                        {description}
                      </p>
                    </div>
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100",
                        slot.overlayClass,
                      )}
                    />
                  </motion.article>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
