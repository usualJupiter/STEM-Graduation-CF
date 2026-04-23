"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"

interface MethodologyProps {
  title?: string
  intro?: string
  steps?: { label: string; description: string }[]
}

const defaultSteps = [
  {
    label: "Feeding",
    description: "Insert cut plastic strips into the heating tube.",
  },
  {
    label: "Melting",
    description:
      "Heat the strips carefully until fully melted, avoiding overheating.",
  },
  {
    label: "Extruding",
    description:
      "Push the molten plastic through a fine nozzle to form a 1.5 mm filament.",
  },
  {
    label: "Winding",
    description:
      "Collect and wind the filament smoothly onto a spool, ready for 3D printing.",
  },
]

const defaultIntro =
  "The transformation starts by feeding plastic strips into the heating system, where precision and timing are key to creating perfect filament. The process follows these steps:"

export default function Methodology({
  title = "Methodology",
  intro = defaultIntro,
  steps = defaultSteps,
}: MethodologyProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={containerVariants}
      className="relative w-full overflow-hidden bg-main py-16"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:gap-10">
        <motion.h2
          variants={fadeUpVariants}
          className="text-2xl font-bold text-main-foreground md:text-4xl"
        >
          {title}
        </motion.h2>
        <motion.div
          variants={fadeUpVariants}
          className="text-base leading-8 text-main-foreground/80 md:text-lg"
        >
          <p className="mb-4">{intro}</p>
          <motion.ul
            variants={containerVariants}
            className="list-disc space-y-2 ps-5"
          >
            {steps.map((step) => (
              <motion.li key={step.label} variants={fadeUpVariants}>
                <span className="font-semibold">{step.label}:</span>{" "}
                {step.description}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.section>
  )
}
