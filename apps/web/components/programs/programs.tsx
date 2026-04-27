"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

import { BrushFrame } from "@/components/brush-frame"
import { fadeUpVariants, sectionContainer } from "@/lib/animations"

const SUBJECT_KEYS = [
  "physics",
  "chemistry",
  "biology",
  "geology",
  "mathematics",
] as const

type SubjectKey = (typeof SUBJECT_KEYS)[number]

const SUBJECT_IMAGES: Record<SubjectKey, string> = {
  physics: "https://cdn.stem-program.com/assets/assets_pyhics.avif",
  chemistry: "https://cdn.stem-program.com/assets/assets_chemistry.avif",
  biology: "https://cdn.stem-program.com/assets/assets_bio.avif",
  geology: "https://cdn.stem-program.com/assets/assets_geo.avif",
  mathematics: "https://cdn.stem-program.com/assets/assets_math.avif",
}

const DETAIL_KEYS = ["course", "duration", "credit", "degree"] as const

export default function Programs() {
  const t = useTranslations("Programs")
  const [subject, setSubject] = useState<SubjectKey>("physics")

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
            value={subject}
            onValueChange={(val) => {
              if (val) setSubject(val as SubjectKey)
            }}
            variant="outline"
            className="w-full max-w-full flex-wrap md:w-fit md:flex-nowrap"
          >
            {SUBJECT_KEYS.map((key) => (
              <ToggleGroupItem
                key={key}
                value={key}
                className="h-10 min-w-[84px] max-w-[160px] flex-1 border-transparent bg-secondry-web px-3 text-sm font-medium text-white hover:bg-secondry-web/90 hover:text-white data-[state=on]:bg-main data-[state=on]:text-main-foreground md:h-14 md:min-w-12 md:max-w-none md:flex-none md:px-8 md:text-lg"
              >
                {t(`subjects.${key}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </motion.div>

        <motion.div
          key={subject}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionContainer}
          className="flex flex-col gap-6 lg:flex-row"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <motion.article
              variants={fadeUpVariants}
              className="rounded-xl border border-secondry-web bg-card shadow-sm"
            >
              <header className="flex flex-col gap-1 p-4">
                <h2 className="text-base font-medium text-card-foreground">
                  {t("overview.heading")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("overview.subheading")}
                </p>
              </header>
              <dl className="flex flex-col gap-2 px-4 pb-4">
                {DETAIL_KEYS.map((field) => (
                  <div key={field} className="flex flex-wrap gap-2">
                    <dt className="text-base font-medium leading-6 text-foreground">
                      {t(`labels.${field}`)}:
                    </dt>
                    <dd className="text-base leading-6 text-foreground">
                      {t(`details.${subject}.${field}`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.article>

            <motion.p
              variants={fadeUpVariants}
              className="whitespace-pre-line break-words text-base leading-7 text-foreground"
            >
              {t(`details.${subject}.description`)}
            </motion.p>
          </div>

          <motion.div
            variants={fadeUpVariants}
            className="w-full shrink-0 lg:w-[420px]"
          >
            <BrushFrame variant="secondary">
              <Image
                src={SUBJECT_IMAGES[subject]}
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
                unoptimized
              />
            </BrushFrame>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
