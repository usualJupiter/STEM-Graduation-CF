"use client"

import { useRef } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

interface GalleryProps {
  images: string[]
}

export default function Gallery({ images }: GalleryProps) {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  })

  const scaleStep = 0.5 / Math.max(1, images.length - 1)

  return (
    <section
      ref={container}
      className="relative flex w-full flex-col items-center justify-center bg-background pb-[30vh] pt-[10vh]"
    >
      {images.map((src, i) => {
        const targetScale = Math.max(
          0.5,
          1 - (images.length - i - 1) * scaleStep,
        )
        return (
          <StickyCard
            key={`${src}-${i}`}
            i={i}
            src={src}
            progress={scrollYProgress}
            range={[(i / images.length) * 0.9, 1]}
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
