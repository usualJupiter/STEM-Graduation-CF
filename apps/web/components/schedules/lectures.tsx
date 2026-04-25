"use client"

import { useState } from "react"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
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

const LEVEL_KEYS = ["level1", "level2", "level3", "level4"] as const

type LevelKey = (typeof LEVEL_KEYS)[number]

const PLACEHOLDER_DRIVE_ID = "1jTnhBA7CO2Hx1DsLhVKeO7Z7D08TfhmE"

const LEVEL_PDFS: Record<LevelKey, string> = {
  level1: `https://drive.google.com/file/d/${PLACEHOLDER_DRIVE_ID}/preview`,
  level2: `https://drive.google.com/file/d/${PLACEHOLDER_DRIVE_ID}/preview`,
  level3: `https://drive.google.com/file/d/${PLACEHOLDER_DRIVE_ID}/preview`,
  level4: `https://drive.google.com/file/d/${PLACEHOLDER_DRIVE_ID}/preview`,
}

interface LecturesProps {
  defaultLevel?: LevelKey
}

export default function Lectures({ defaultLevel = "level1" }: LecturesProps) {
  const t = useTranslations("Schedules")
  const [level, setLevel] = useState<LevelKey>(defaultLevel)

  return (
    <section className="bg-background px-6 py-12 md:px-8 md:py-16 lg:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={container}
        className="mx-auto flex max-w-7xl flex-col gap-6"
      >
        <motion.div variants={fadeUp}>
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
          variants={fadeUp}
          className="overflow-hidden rounded-xl border border-secondry-web bg-card shadow-sm"
        >
          <iframe
            key={level}
            src={LEVEL_PDFS[level]}
            title={t("pdfTitle")}
            className="h-[70vh] min-h-[480px] w-full"
            allow="autoplay"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
