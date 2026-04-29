"use client"

import { motion } from "motion/react"

import {
  fadeUpVariants,
  inViewport,
  sectionContainer,
} from "@/lib/animations"

interface TextSectionProps {
  title: string
  description: string
  bgClass: string
  headingClass: string
  bodyClass: string
}

export function TextSection({
  title,
  description,
  bgClass,
  headingClass,
  bodyClass,
}: TextSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={sectionContainer}
      className={`relative w-full overflow-hidden py-16 ${bgClass}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:gap-10">
        <motion.h2
          variants={fadeUpVariants}
          className={`text-2xl font-bold md:text-4xl ${headingClass}`}
        >
          {title}
        </motion.h2>
        <motion.p
          variants={fadeUpVariants}
          className={`whitespace-pre-line text-base leading-8 md:text-lg ${bodyClass}`}
        >
          {description}
        </motion.p>
      </div>
    </motion.section>
  )
}
