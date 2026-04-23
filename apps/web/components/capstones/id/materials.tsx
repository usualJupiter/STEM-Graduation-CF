"use client"

import { motion } from "motion/react"

import { AspectRatio } from "@workspace/ui/components/aspect-ratio"

import {
  containerVariants,
  fadeUpVariants,
  inViewport,
} from "./animations"

interface MaterialsProps {
  title?: string
}

const materials = [
  {
    id: 1,
    title: "Title Text",
    description: "This is a card description.",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 2,
    title: "Title Text",
    description: "This is a card description.",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 3,
    title: "Title Text",
    description: "This is a card description.",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 4,
    title: "Title Text",
    description: "This is a card description.",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 5,
    title: "Title Text",
    description: "This is a card description.",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
]

export default function Materials({ title = "Materials" }: MaterialsProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={containerVariants}
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
          variants={containerVariants}
          className="grid grid-cols-1 gap-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {materials.map((material) => (
            <motion.div
              key={material.id}
              variants={fadeUpVariants}
              className="flex flex-col overflow-hidden rounded-none border border-border bg-card shadow-sm"
            >
              <div className="flex flex-col gap-1 p-3">
                <p className="text-sm font-medium text-card-foreground">
                  {material.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {material.description}
                </p>
              </div>
              <div className="px-3 pb-3">
                <AspectRatio ratio={3 / 2}>
                  <img
                    src={material.image}
                    alt={material.title}
                    className="h-full w-full object-cover"
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
