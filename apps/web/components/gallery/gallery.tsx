"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

const GALLERY_IMAGES = [
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

export default function Gallery() {
  const gallery = useRef<HTMLDivElement>(null)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  })

  const { height } = dimension
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3])

  useEffect(() => {
    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", resize)
    resize()
    return () => window.removeEventListener("resize", resize)
  }, [])

  return (
    <section className="relative bg-background px-4 py-16 md:px-8 md:py-24">
      <div
        ref={gallery}
        className="relative box-border flex h-[175vh] gap-[2vw] overflow-hidden bg-white p-[2vw]"
      >
        <Column images={GALLERY_IMAGES.slice(0, 3)} y={y} top="-45%" />
        <Column images={GALLERY_IMAGES.slice(3, 6)} y={y2} top="-95%" />
        <Column images={GALLERY_IMAGES.slice(6, 9)} y={y3} top="-45%" />
        <Column images={GALLERY_IMAGES.slice(9, 12)} y={y4} top="-75%" />
      </div>
    </section>
  )
}

type ColumnProps = {
  images: string[]
  y: MotionValue<number>
  top: string
}

function Column({ images, y, top }: ColumnProps) {
  return (
    <motion.div
      className="relative flex h-full w-1/4 min-w-[250px] flex-col gap-[2vw]"
      style={{ y, top }}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative aspect-[3/4] w-full overflow-hidden"
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="pointer-events-none object-cover"
            priority
            unoptimized
          />
        </div>
      ))}
    </motion.div>
  )
}
