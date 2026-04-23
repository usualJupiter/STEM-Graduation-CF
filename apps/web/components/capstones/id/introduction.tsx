"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"

interface IntroductionProps {
  title?: string
  description?: string
}

export default function Introduction({
  title = "Introduction",
  description = "Plastic pollution poses a serious threat to our environment. Our solution repurposes used plastic bottles into 3D printer filament, providing an eco-friendly and low-cost alternative. This process encourages recycling, supports innovation, and opens new possibilities in healthcare",
}: IntroductionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={containerVariants}
      className="relative w-full overflow-hidden bg-web-card-3 py-16"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:gap-10">
        <motion.h2
          variants={fadeUpVariants}
          className="text-2xl font-bold text-primary md:text-4xl"
        >
          {title}
        </motion.h2>
        <motion.p
          variants={fadeUpVariants}
          className="text-base leading-8 text-primary/80 md:text-lg"
        >
          {description}
        </motion.p>
      </div>
    </motion.section>
  )
}
