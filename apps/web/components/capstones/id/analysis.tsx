"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"

interface AnalysisProps {
  title?: string
  descriptions?: string[]
}

const defaultParagraphs = [
  "Through two main tests, the prototype showed strong performance in filament production. In manual pulling tests, the filament reached 160 cm in 20 minutes, maintaining consistent heat between 190–220°C.",
  "After integrating a motorized pulling system, the production improved significantly, achieving 1.8 meters of filament in just 10 minutes, with a stable diameter of 1.5–1.7 mm—perfect for 3D printing.",
  "User feedback confirmed the system's high safety (88%), ease of use, and reliable performance. Minor refinements are recommended to further enhance stability & efficiency.",
]

export default function Analysis({
  title = "Analysis & Results",
  descriptions = defaultParagraphs,
}: AnalysisProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={containerVariants}
      className="relative w-full overflow-hidden bg-secondry-web py-16"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:gap-10">
        <motion.h2
          variants={fadeUpVariants}
          className="text-2xl font-bold text-primary-foreground md:text-4xl"
        >
          {title}
        </motion.h2>
        <div className="flex flex-col gap-6">
          {descriptions.map((paragraph, index) => (
            <motion.p
              key={index}
              variants={fadeUpVariants}
              className="text-base leading-8 text-primary-foreground/80 md:text-lg"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
