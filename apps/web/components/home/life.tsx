"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import { BrushFrame } from "@/components/brush-frame"
import { Link } from "@/i18n/navigation"

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

export default function Life() {
  const t = useTranslations("Life")

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
      className="w-full bg-web-third py-16 md:py-24"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 md:flex-row md:gap-16 md:px-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-5">
            <motion.span
              variants={fadeUp}
              className="text-sm font-medium text-black"
            >
              {t("tagline")}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-semibold tracking-tight text-black md:text-5xl md:leading-[48px]"
            >
              {t("title")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-black/90 md:text-2xl md:leading-8"
            >
              {t("description")}
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <Button
              variant="transparent-outline"
              asChild
              className="h-12 border-black px-6 text-base font-bold text-black [&_svg]:size-5 hover:bg-black/10 hover:text-black"
            >
              <Link href="/gallery">
                {t("cta")}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          variants={fadeUp}
          className="w-full shrink-0 md:w-[360px] lg:w-[440px] xl:w-[520px]"
        >
          <BrushFrame>
            <Image
              src="https://cdn.stem-program.com/assets/life.jpg"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 520px, (min-width: 1024px) 440px, (min-width: 768px) 360px, 100vw"
              unoptimized
            />
          </BrushFrame>
        </motion.div>
      </div>
    </motion.section>
  )
}
