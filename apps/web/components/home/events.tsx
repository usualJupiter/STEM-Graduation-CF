"use client"

import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import { cn } from "@workspace/ui/lib/utils"

import { BrushFrame } from "@/components/brush-frame"
import { Link } from "@/i18n/navigation"

const EVENT_KEYS = [
  {
    key: "sustainability",
    href: "/events/sustainability",
    cardClass: "md:row-span-2",
    borderClass: "border-yellow-500",
    overlayClass: "bg-yellow-500",
    image: "/assets/event1.jpg",
    large: true,
  },
  {
    key: "newcomers",
    href: "/events/newcomers",
    cardClass: "",
    borderClass: "border-defult-web",
    overlayClass: "bg-defult-web",
    image: "/assets/event2.jpg",
    large: false,
  },
  {
    key: "placeholder1",
    href: "/events/placeholder1",
    cardClass: "",
    borderClass: "border-yellow-500",
    overlayClass: "bg-yellow-500",
    image: "/assets/event3.jpg",
    large: false,
  },
] as const

interface EventsProps {
  className?: string
  seeAllHref?: string
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

export default function Events({
  className,
  seeAllHref = "/events",
}: EventsProps) {
  const t = useTranslations("Events")

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={container}
      className={cn(
        "flex w-full flex-col items-center bg-web-fourth py-16 md:py-24",
        className
      )}
    >
      <div className="w-full max-w-7xl px-6">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          <div className="flex max-w-xl flex-col items-center gap-5 text-center">
            <motion.div variants={fadeUp}>
              <Link
                href={seeAllHref}
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

          <motion.div
            variants={gridContainer}
            className="grid w-full grid-cols-1 gap-3 md:grid-cols-[2fr_1fr] md:grid-rows-2"
          >
            {EVENT_KEYS.map((event) => (
              <motion.article
                key={event.key}
                variants={fadeUp}
                className={cn(
                  "group relative flex flex-col overflow-hidden border-[8px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-black/40",
                  event.cardClass,
                  event.borderClass
                )}
              >
                <Link
                  href={event.href}
                  aria-label={t(`items.${event.key}.title`)}
                  className="absolute inset-0 z-20"
                />
                {event.large ? (
                  <BrushFrame
                    variant="secondary"
                    className="z-10 md:aspect-auto md:flex-1"
                  >
                    <Image
                      src={event.image}
                      alt={t(`items.${event.key}.title`)}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 66vw, 100vw"
                      unoptimized
                    />
                  </BrushFrame>
                ) : (
                  <BrushFrame variant="tertiary" className="z-10">
                    <Image
                      src={event.image}
                      alt={t(`items.${event.key}.title`)}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                      unoptimized
                    />
                  </BrushFrame>
                )}
                <div className="relative z-10 flex flex-col gap-2 p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-black md:text-2xl md:leading-8">
                    {t(`items.${event.key}.title`)}
                  </h3>
                  <p className="text-sm text-black/70 md:text-base md:leading-6">
                    {t(`items.${event.key}.description`)}
                  </p>
                </div>
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100",
                    event.overlayClass
                  )}
                />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
