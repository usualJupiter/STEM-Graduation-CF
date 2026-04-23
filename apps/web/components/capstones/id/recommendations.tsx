"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"

interface RecommendationsProps {
  title?: string
  intro?: string
  items?: string[]
}

const defaultItems = [
  "Add precise temperature sensors for better heating control.",
  "Integrate a real-time filament diameter monitoring system.",
  "Upgrade to a smarter, energy-efficient power supply.",
  "Implement an automated cooling system for improved filament quality.",
]

const defaultIntro =
  "To further enhance the system's performance and reliability, the following improvements are suggested:"

export default function Recommendations({
  title = "Recommendations",
  intro = defaultIntro,
  items = defaultItems,
}: RecommendationsProps) {
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
        <motion.div
          variants={fadeUpVariants}
          className="text-base leading-8 text-primary/80 md:text-lg"
        >
          <p className="mb-4">{intro}</p>
          <motion.ul
            variants={containerVariants}
            className="list-none space-y-2"
          >
            {items.map((item, index) => (
              <motion.li
                key={index}
                variants={fadeUpVariants}
                className="flex gap-2"
              >
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.section>
  )
}
