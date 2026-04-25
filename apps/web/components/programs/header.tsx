"use client"

import Image from "next/image"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import { BrushFrame } from "@/components/brush-frame"

interface HeaderProps {
  imageUrl?: string
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
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

export default function Header({
  imageUrl = "/assets/programs.png",
}: HeaderProps) {
  const t = useTranslations("ProgramsHeader")

  return (
    <section className="bg-main text-main-foreground">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-3 lg:flex-row lg:items-center lg:gap-12"
      >
        <div className="flex flex-1 flex-col items-start gap-8">
          <motion.h1
            variants={fadeUp}
            className="whitespace-pre-line text-3xl font-bold leading-tight sm:text-5xl xl:text-7xl xl:leading-none"
          >
            {t("title")}
          </motion.h1>
        </div>
        <div className="w-full max-w-[320px] flex-shrink-0 lg:w-[380px] lg:max-w-none xl:w-[440px]">
          <motion.div variants={fadeUp}>
            <BrushFrame>
              <Image
                src={imageUrl}
                alt={t("imageAlt")}
                fill
                sizes="(min-width: 1280px) 440px, (min-width: 1024px) 380px, 320px"
                className="object-cover"
                priority
                unoptimized
              />
            </BrushFrame>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
