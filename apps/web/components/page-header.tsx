"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"

import { BrushFrame } from "@/components/brush-frame"
import { fadeUpVariants, headerContainer } from "@/lib/animations"

interface PageHeaderProps {
  /** Translation namespace exposing `title` and `imageAlt` keys. */
  namespace: string
  imageSrc: string
}

export function PageHeader({ namespace, imageSrc }: PageHeaderProps) {
  const t = useTranslations(namespace)

  return (
    <section className="bg-main text-main-foreground">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerContainer}
        className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-3 lg:flex-row lg:items-center lg:gap-12"
      >
        <motion.h1
          variants={fadeUpVariants}
          className="flex-1 whitespace-pre-line text-3xl font-bold leading-tight sm:text-5xl xl:text-7xl xl:leading-none"
        >
          {t("title")}
        </motion.h1>
        <motion.div
          variants={fadeUpVariants}
          className="w-full max-w-[320px] flex-shrink-0 lg:w-[380px] lg:max-w-none xl:w-[440px]"
        >
          <BrushFrame>
            <Image
              src={imageSrc}
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1280px) 440px, (min-width: 1024px) 380px, 320px"
              className="object-cover"
              priority
              unoptimized
            />
          </BrushFrame>
        </motion.div>
      </motion.div>
    </section>
  )
}
