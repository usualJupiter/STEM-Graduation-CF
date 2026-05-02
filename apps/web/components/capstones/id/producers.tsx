"use client"

import { motion } from "motion/react"
import Image from "next/image"

import {
  fadeUpVariants,
  inViewport,
  sectionContainer,
} from "@/lib/animations"

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
      variants={sectionContainer}
      className="w-full bg-background"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16">
        <motion.h2
          variants={fadeUpVariants}
          className="text-2xl font-bold text-primary md:text-4xl"
        >
          {title}
        </motion.h2>
        <motion.div
          variants={fadeUpVariants}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-lg"
        >
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </motion.div>
      </div>
    </motion.section>
  )
}
