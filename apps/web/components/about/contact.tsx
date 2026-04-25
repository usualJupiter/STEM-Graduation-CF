"use client"

import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"

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

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.007653326953!2d31.167717476128225!3d27.187496248226655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14450bfb7a5cb539%3A0x38d71298729ac58a!2sAssiut%20University!5e0!3m2!1sen!2seg!4v1777133409339!5m2!1sen!2seg"

export default function Contact() {
  const tFooter = useTranslations("Footer")
  const tAbout = useTranslations("About")

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="relative w-full overflow-hidden bg-white py-16"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 md:gap-12">
        <motion.p
          variants={fadeUpVariants}
          className="max-w-3xl whitespace-pre-line text-base leading-7 text-primary/80 md:text-lg md:leading-8"
        >
          {tAbout("letter")}
        </motion.p>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
          <motion.div
            variants={fadeUpVariants}
            className="flex flex-col gap-5"
          >
            <h2 className="text-2xl font-bold tracking-tight text-primary md:text-4xl">
              {tFooter("orgName")}
            </h2>
            <p className="whitespace-pre-line text-base leading-7 text-primary/80 md:text-lg md:leading-8">
              {tFooter("contact")}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            className="overflow-hidden rounded-xl border border-primary/10 shadow-sm"
          >
            <iframe
              src={MAP_SRC}
              title={tAbout("mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[300px] w-full md:h-[360px]"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
