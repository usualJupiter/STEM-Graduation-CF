"use client"

import { motion, type Variants } from "motion/react"
import { useLocale, useTranslations } from "next-intl"

import {
  CapstoneCarousel,
  type CapstoneCarouselItem,
} from "./capstone-carousel"
import type { CapstoneListItem } from "@/lib/api"

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
}

const inViewport = { once: true, amount: 0.2 } as const

const FALLBACK_IMAGE = "/assets/project1.jpg"

const LEVELS = [
  {
    level: 1,
    key: "level1",
    sectionClass: "bg-secondry-web",
    headingClass: "text-main-foreground",
    emptyClass: "text-main-foreground/70",
  },
  {
    level: 2,
    key: "level2",
    sectionClass: "bg-web-third",
    headingClass: "text-primary",
    emptyClass: "text-primary/70",
  },
  {
    level: 3,
    key: "level3",
    sectionClass: "bg-white",
    headingClass: "text-primary",
    emptyClass: "text-primary/70",
  },
] as const

interface LevelsProps {
  items: CapstoneListItem[]
}

export default function Levels({ items }: LevelsProps) {
  const t = useTranslations("Capstones")
  const locale = useLocale()

  return (
    <div className="flex flex-col">
      {LEVELS.map(({ level, key, sectionClass, headingClass, emptyClass }) => {
        const filtered = items.filter((c) => c.level === level)
        const carouselItems: CapstoneCarouselItem[] = filtered.map((c) => ({
          slug: c.slug,
          src: c.card_photo_url ?? FALLBACK_IMAGE,
          alt:
            locale === "ar"
              ? c.title_ar || c.title_en
              : c.title_en || c.title_ar,
        }))

        return (
          <motion.section
            key={key}
            initial="hidden"
            whileInView="visible"
            viewport={inViewport}
            variants={containerVariants}
            className={`relative w-full overflow-hidden py-16 ${sectionClass}`}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:gap-10">
              <motion.h2
                variants={fadeUpVariants}
                className={`text-2xl font-bold md:text-4xl ${headingClass}`}
              >
                {t(`levels.${key}`)}
              </motion.h2>
              {carouselItems.length > 0 ? (
                <motion.div variants={fadeUpVariants}>
                  <CapstoneCarousel items={carouselItems} />
                </motion.div>
              ) : (
                <motion.p
                  variants={fadeUpVariants}
                  className={`text-base ${emptyClass}`}
                >
                  {t("empty")}
                </motion.p>
              )}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}
