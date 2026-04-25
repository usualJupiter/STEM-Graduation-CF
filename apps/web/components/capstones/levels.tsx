"use client"

import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import {
  CapstoneCarousel,
  type CapstoneCarouselItem,
} from "./capstone-carousel"

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

const PROJECT_IMAGES = [
  "/assets/project1.jpg",
  "/assets/prject2.jpg",
  "/assets/project3.jpg",
  "/assets/project4.jpg",
  "/assets/project5.jpg",
  "/assets/project6.jpg",
]

const LEVELS = [
  {
    key: "level1",
    sectionClass: "bg-secondry-web",
    headingClass: "text-main-foreground",
  },
  {
    key: "level2",
    sectionClass: "bg-web-third",
    headingClass: "text-primary",
  },
  {
    key: "level3",
    sectionClass: "bg-white",
    headingClass: "text-primary",
  },
] as const

type LevelKey = (typeof LEVELS)[number]["key"]

function buildItems(level: LevelKey): CapstoneCarouselItem[] {
  return PROJECT_IMAGES.map((src, i) => ({
    id: `${level}-${i + 1}`,
    src,
    alt: `${level} capstone ${i + 1}`,
  }))
}

export default function Levels() {
  const t = useTranslations("Capstones.levels")

  return (
    <div className="flex flex-col">
      {LEVELS.map(({ key, sectionClass, headingClass }) => (
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
              {t(key)}
            </motion.h2>
            <motion.div variants={fadeUpVariants}>
              <CapstoneCarousel items={buildItems(key)} />
            </motion.div>
          </div>
        </motion.section>
      ))}
    </div>
  )
}
