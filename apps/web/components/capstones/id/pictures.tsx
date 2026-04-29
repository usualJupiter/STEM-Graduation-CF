"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"
import { StickyCards } from "./sticky-cards"

interface PicturesProps {
  title: string
  images: { id: number | string; image: string; alt?: string }[]
}

export default function Pictures({ title, images }: PicturesProps) {
  if (images.length === 0) return null

  return (
    <section className="w-full bg-background">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={inViewport}
        variants={containerVariants}
        className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 pt-16"
      >
        <motion.h2
          variants={fadeUpVariants}
          className="text-2xl font-bold tracking-tight text-primary md:text-4xl"
        >
          {title}
        </motion.h2>
      </motion.div>

      <StickyCards cards={images} />
    </section>
  )
}
