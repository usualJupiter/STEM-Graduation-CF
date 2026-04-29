"use client"

import { motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"

import {
  HoverExpand,
  type HoverExpandItem,
} from "@/components/hover-expand"
import type { CapstoneListItem } from "@/lib/api"
import { fadeUpVariants, sectionContainer } from "@/lib/animations"

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
        const expandItems: HoverExpandItem[] = items
          .filter((c) => c.level === level)
          .map((c) => {
            const title =
              locale === "ar"
                ? c.title_ar || c.title_en
                : c.title_en || c.title_ar
            const fullName =
              locale === "ar"
                ? c.full_name_ar || c.full_name_en
                : c.full_name_en || c.full_name_ar
            const year = new Date(c.created_at).getFullYear()
            return {
              label: title,
              sublabel: Number.isFinite(year) ? String(year) : undefined,
              description: fullName,
              image: c.card_photo_url ?? FALLBACK_IMAGE,
              imageAlt: title,
              href: `/capstones/${c.slug}`,
            }
          })

        return (
          <motion.section
            key={key}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionContainer}
            className={`relative w-full overflow-hidden py-16 ${sectionClass}`}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:gap-10">
              <motion.h2
                variants={fadeUpVariants}
                className={`text-2xl font-bold md:text-4xl ${headingClass}`}
              >
                {t(`levels.${key}`)}
              </motion.h2>
              {expandItems.length > 0 ? (
                <motion.div variants={fadeUpVariants}>
                  <HoverExpand items={expandItems} />
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
