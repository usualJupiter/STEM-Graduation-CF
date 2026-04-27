"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"

export type HoverExpandItem = {
  src: string
  alt: string
}

interface HoverExpandProps {
  items: HoverExpandItem[]
}

export function HoverExpand({ items }: HoverExpandProps) {
  const [active, setActive] = useState(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex w-full flex-col items-stretch gap-1"
    >
      {items.map((item, index) => {
        const isActive = active === index
        return (
          <motion.div
            key={item.src}
            initial={false}
            animate={{ height: isActive ? "24rem" : "2.5rem" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setActive(index)}
            onHoverStart={() => setActive(index)}
            className="relative w-full cursor-pointer overflow-hidden rounded-3xl"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 380px, 100vw"
              className="object-cover"
              unoptimized
            />
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                />
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
