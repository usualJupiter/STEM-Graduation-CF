"use client"

import { useRef } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

const PLACEHOLDER_IMAGES = [
  "/assets/event1.jpg",
  "/assets/project1.jpg",
  "/assets/life.jpg",
  "/assets/event2.jpg",
  "/assets/prject2.jpg",
  "/assets/hero.png",
  "/assets/project3.jpg",
  "/assets/event3.jpg",
  "/assets/project4.jpg",
  "/assets/project5.jpg",
  "/assets/project6.jpg",
  "/assets/project1.jpg",
]

interface GalleryProps {
  images?: string[]
}

export default function Gallery({ images }: GalleryProps) {
  const realImages = images ?? []
  const all = realImages.length > 0 ? realImages : PLACEHOLDER_IMAGES

  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={container}
      className="relative flex w-full flex-col items-center justify-center bg-background pb-[30vh] pt-[10vh]"
    >
      {all.map((src, i) => {
        const scaleStep = 0.5 / Math.max(1, all.length - 1)
        const targetScale = Math.max(
          0.5,
          1 - (all.length - i - 1) * scaleStep,
        )
        return (
          <StickyCard
            key={`${src}-${i}`}
            i={i}
            src={src}
            progress={scrollYProgress}
            range={[(i / all.length) * 0.9, 1]}
            targetScale={targetScale}
          />
        )
      })}
    </section>
  )
}

interface StickyCardProps {
  i: number
  src: string
  progress: MotionValue<number>
  range: [number, number]
  targetScale: number
}

function StickyCard({ i, src, progress, range, targetScale }: StickyCardProps) {
  const scale = useTransform(progress, range, [1, targetScale])
  const stackOffset = Math.min(i * 12, 240) + 80

  return (
    <div className="sticky top-0 flex items-center justify-center">
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${stackOffset}px)`,
        }}
        className="relative -top-1/4 flex aspect-[4/3] w-[92vw] max-w-[1200px] origin-top flex-col overflow-hidden rounded-3xl shadow-2xl"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 768px) 1200px, 92vw"
          className="object-cover"
          priority={i < 2}
          loading={i < 2 ? "eager" : "lazy"}
          unoptimized
        />
      </motion.div>
    </div>
  )
}
