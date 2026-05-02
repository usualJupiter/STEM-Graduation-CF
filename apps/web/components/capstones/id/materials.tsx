"use client"

import { motion } from "motion/react"
import Image from "next/image"

import { AspectRatio } from "@workspace/ui/components/aspect-ratio"

import {
  fadeUpVariants,
  inViewport,
  sectionContainer,
} from "@/lib/animations"

interface MaterialItem {
  id: number | string
  title: string
  image: string
}

interface MaterialsProps {
  title: string
  items: MaterialItem[]
}

export default function Materials({ title, items }: MaterialsProps) {
  if (items.length === 0) return null

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={sectionContainer}
      className="w-full bg-background"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 md:px-6 lg:px-8">
        <motion.div
          variants={fadeUpVariants}
          className="flex flex-col items-center gap-5 lg:items-start"
        >
          <h2 className="text-4xl font-bold leading-none text-primary">
            {title}
          </h2>
        </motion.div>

        <motion.div
          variants={sectionContainer}
          className="grid grid-cols-1 gap-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {items.map((material) => (
            <motion.div
              key={material.id}
              variants={fadeUpVariants}
              className="flex flex-col overflow-hidden rounded-none border border-border bg-card shadow-sm"
            >
              <div className="flex flex-col gap-1 p-3">
                <p className="text-sm font-medium text-card-foreground">
                  {material.title}
                </p>
              </div>
              <div className="px-3 pb-3">
                <AspectRatio ratio={3 / 2} className="relative">
                  <Image
                    src={material.image}
                    alt={material.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover"
                  />
                </AspectRatio>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
