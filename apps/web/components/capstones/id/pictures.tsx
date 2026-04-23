"use client"

import { motion } from "motion/react"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"
import { StickyCards } from "./sticky-cards"

interface PicturesProps {
  title?: string
  images?: { id: number | string; image: string; alt?: string }[]
}

const DEFAULT_IMAGES = [
  { id: 1, image: "/assets/project1.jpg" },
  { id: 2, image: "/assets/prject2.jpg" },
  { id: 3, image: "/assets/project3.jpg" },
  { id: 4, image: "/assets/project4.jpg" },
  { id: 5, image: "/assets/project5.jpg" },
  { id: 6, image: "/assets/project6.jpg" },
]

export default function Pictures({
  title = "Project Pictures",
  images = DEFAULT_IMAGES,
}: PicturesProps) {
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
