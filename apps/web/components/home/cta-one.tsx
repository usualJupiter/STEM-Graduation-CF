"use client"

import { ArrowRight } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"

const PROGRAM_KEYS = [
  "physics",
  "chemistry",
  "biology",
  "geology",
  "mathematics",
] as const

const CARD_CLASSES = [
  "bg-web-card-1 text-main [a]:hover:bg-web-card-1/90",
  "bg-web-card-2 text-main [a]:hover:bg-web-card-2/90",
  "bg-web-card-3 text-main [a]:hover:bg-web-card-3/90",
  "bg-web-card-4 text-main [a]:hover:bg-web-card-4/90",
] as const

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

export default function CtaOne() {
  const t = useTranslations("CtaOne")

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
      className="w-full bg-secondry-web"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 py-12 md:flex-row md:items-stretch md:justify-between md:gap-16 md:px-16 md:py-24">
        <div className="flex max-w-[700px] flex-col gap-10">
          <div className="flex flex-col gap-5">
            <motion.h2
              variants={fadeUp}
              className="text-2xl font-bold text-main-foreground md:text-4xl"
            >
              {t("heading")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="whitespace-pre-line text-base text-main-foreground/80 md:text-lg md:leading-8"
            >
              {t("description")}
            </motion.p>
          </div>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
            <Button
              variant="transparent-outline"
              asChild
              className="h-12 px-6 text-base font-bold [&_svg]:size-5"
            >
              <Link href="/apply">
                {t("apply")}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </Link>
            </Button>
            <Button
              variant="transparent-outline"
              asChild
              className="h-12 px-6 text-base font-bold [&_svg]:size-5"
            >
              <Link href="/programs">
                {t("browsePrograms")}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          variants={fadeUp}
          className="flex w-full max-w-xl flex-col gap-2"
        >
          <p className="mb-1 text-sm font-bold text-main-foreground/80">
            {t("quickLinks")}
          </p>
          <ul className="flex flex-col gap-2 md:flex-1">
            {PROGRAM_KEYS.map((key, i) => (
              <li key={key}>
                <Button
                  asChild
                  className={cn(
                    "h-auto min-h-12 w-full justify-start whitespace-normal px-4 py-2 text-start text-sm font-bold leading-snug [&_svg]:size-5 md:px-6 md:text-base",
                    CARD_CLASSES[i % CARD_CLASSES.length]
                  )}
                >
                  <Link href="/programs">
                    <ArrowRight aria-hidden className="rtl:rotate-180" />
                    {t(`programs.${key}`)}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.section>
  )
}
