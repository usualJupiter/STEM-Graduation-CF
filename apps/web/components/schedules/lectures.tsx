"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

import { fadeUpVariants, sectionContainer } from "@/lib/animations"
import type { ScheduleLevel } from "@/lib/api"

const LEVEL_KEYS = ["level1", "level2", "level3", "level4"] as const

type LevelKey = (typeof LEVEL_KEYS)[number]

const PLACEHOLDER_URL =
  "https://drive.google.com/file/d/1jTnhBA7CO2Hx1DsLhVKeO7Z7D08TfhmE/preview"

interface LecturesProps {
  levels: ScheduleLevel[]
}

export default function Lectures({ levels }: LecturesProps) {
  const t = useTranslations("Schedules")
  const [level, setLevel] = useState<LevelKey>("level1")

  const num = Number(level.slice(5))
  const pdfUrl =
    levels.find((l) => l.level === num)?.drive_url ?? PLACEHOLDER_URL

  return (
    <section className="bg-background px-6 py-12 md:px-8 md:py-16 lg:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionContainer}
        className="mx-auto flex max-w-7xl flex-col gap-6"
      >
        <motion.div variants={fadeUpVariants}>
          <ToggleGroup
            type="single"
            value={level}
            onValueChange={(val) => {
              if (val) setLevel(val as LevelKey)
            }}
            variant="outline"
            className="w-full max-w-full flex-wrap md:w-fit md:flex-nowrap"
          >
            {LEVEL_KEYS.map((key) => (
              <ToggleGroupItem
                key={key}
                value={key}
                className="h-10 min-w-[84px] max-w-[160px] flex-1 border-transparent bg-secondry-web px-3 text-sm font-medium text-white hover:bg-secondry-web/90 hover:text-white data-[state=on]:bg-main data-[state=on]:text-main-foreground md:h-14 md:min-w-12 md:max-w-none md:flex-none md:px-8 md:text-lg"
              >
                {t(`levels.${key}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </motion.div>

        <motion.div
          variants={fadeUpVariants}
          className="overflow-hidden rounded-xl border border-secondry-web bg-card shadow-sm"
        >
          <iframe
            key={level}
            src={pdfUrl}
            title={t("pdfTitle")}
            className="h-[70vh] min-h-[480px] w-full"
            allow="autoplay"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
