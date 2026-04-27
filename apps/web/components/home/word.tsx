"use client"

import Image from "next/image"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import { BrushFrame } from "@/components/brush-frame"

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
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

export default function Aword() {
  const t = useTranslations("Aword")

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={container}
      className="w-full bg-web-card-1"
    >
      <div className="flex flex-col items-center px-6 py-16 md:py-24">
        <div className="flex w-full max-w-7xl flex-col items-center gap-8 md:flex-row md:gap-16">
          <motion.div
            variants={fadeUp}
            className="w-full max-w-[298px] shrink-0"
          >
            <BrushFrame>
              <Image
                src="https://cdn.stem-program.com/assets/assets_drmarien.avif"
                alt={t("name")}
                fill
                sizes="(min-width: 768px) 298px, 100vw"
                className="object-cover"
                unoptimized
              />
            </BrushFrame>
          </motion.div>
          <motion.figure variants={fadeUp} className="flex flex-col gap-8">
            <blockquote className="text-xl font-medium leading-8 text-black md:text-2xl">
              &ldquo;{t("quote")}&rdquo;
            </blockquote>
            <figcaption className="flex flex-col gap-0.5">
              <p className="text-base font-semibold leading-6 text-black">
                {t("name")}
              </p>
              <p className="text-base leading-6 text-black/80">{t("role")}</p>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </motion.section>
  )
}
