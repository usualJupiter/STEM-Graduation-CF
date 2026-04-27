"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import { BrushFrame } from "@/components/brush-frame"
import { Link } from "@/i18n/navigation"
import { fadeUpVariants, headerContainer } from "@/lib/animations"

const HERO_IMAGE_URL = "https://cdn.stem-program.com/assets/assets_hero.avif"

export default function Hero() {
  const t = useTranslations("Hero")

  return (
    <section className="bg-main text-main-foreground">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerContainer}
        className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-12 md:py-24 lg:flex-row lg:gap-12"
      >
        <div className="flex flex-1 flex-col items-start gap-8">
          <div className="flex flex-col items-start gap-6">
            <motion.h1
              variants={fadeUpVariants}
              className="whitespace-pre-line text-3xl font-bold leading-tight sm:text-5xl xl:text-7xl xl:leading-none"
            >
              {t("heading")}
            </motion.h1>
            <motion.p
              variants={fadeUpVariants}
              className="max-w-xl text-base sm:text-lg sm:leading-8"
            >
              {t("description")}
            </motion.p>
          </div>
          <motion.div variants={fadeUpVariants}>
            <Button
              asChild
              className="h-12 bg-defult-web px-6 text-base text-main [&_svg]:size-5 [a]:hover:bg-defult-web/90"
            >
              <Link href="/programs">
                {t("cta")}
                <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </div>
        <div className="w-full flex-shrink-0 lg:relative lg:z-10 lg:w-[560px] lg:translate-y-24 xl:w-[680px] xl:translate-y-28">
          <motion.div variants={fadeUpVariants}>
            <BrushFrame>
              <Image
                src={HERO_IMAGE_URL}
                alt={t("imageAlt")}
                fill
                sizes="(min-width: 1280px) 680px, (min-width: 1024px) 560px, 100vw"
                className="object-cover object-[center_30%]"
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
