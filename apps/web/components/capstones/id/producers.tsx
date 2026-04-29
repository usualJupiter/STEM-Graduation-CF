"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"

interface ProducersProps {
  title: string
  imageUrl: string
  imageAlt?: string
}

export default function Producers({
  title,
  imageUrl,
  imageAlt,
}: ProducersProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={containerVariants}
      className="w-full bg-background"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16">
        <motion.h2
          variants={fadeUpVariants}
          className="text-2xl font-bold text-primary md:text-4xl"
        >
          {title}
        </motion.h2>
        <motion.div variants={fadeUpVariants} className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt ?? title}
            className="w-full rounded-lg object-cover"
          />
        </motion.div>
      </div>
    </motion.section>
  )
}
