"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"

import { cn } from "@workspace/ui/lib/utils"

interface StickyCardData {
  id: number | string
  image: string
  alt?: string
}

interface StickyCardsProps {
  cards: StickyCardData[]
  className?: string
  containerClassName?: string
  imageClassName?: string
}

export function StickyCards({
  cards,
  className,
  containerClassName,
  imageClassName,
}: StickyCardsProps) {
  const container = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger)

      const imageElements = imageRefs.current
      const totalCards = imageElements.length

      if (!imageElements[0]) return

      gsap.set(imageElements[0], { y: "0%", scale: 1, rotation: 0 })

      for (let i = 1; i < totalCards; i++) {
        if (!imageElements[i]) continue
        gsap.set(imageElements[i], { y: "100%", scale: 1, rotation: 0 })
      }

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".sticky-cards",
          start: "top top",
          end: `+=${window.innerHeight * (totalCards - 1)}`,
          pin: true,
          scrub: 0.5,
          pinSpacing: true,
        },
      })

      for (let i = 0; i < totalCards - 1; i++) {
        const currentImage = imageElements[i]
        const nextImage = imageElements[i + 1]
        const position = i
        if (!currentImage || !nextImage) continue

        scrollTimeline.to(
          currentImage,
          { scale: 0.7, rotation: 5, duration: 1, ease: "none" },
          position,
        )

        scrollTimeline.to(
          nextImage,
          { y: "0%", duration: 1, ease: "none" },
          position,
        )
      }

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh()
      })

      if (container.current) {
        resizeObserver.observe(container.current)
      }

      return () => {
        resizeObserver.disconnect()
        scrollTimeline.kill()
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }
    },
    { scope: container },
  )

  return (
    <div className={cn("relative w-full", className)} ref={container}>
      <div className="sticky-cards relative flex h-[70vh] w-full items-center justify-center overflow-hidden p-3 lg:p-8">
        <div
          className={cn(
            "relative h-full w-full max-w-7xl overflow-hidden rounded-lg",
            containerClassName,
          )}
        >
          {cards.map((card, i) => (
            <img
              key={card.id}
              src={card.image}
              alt={card.alt || ""}
              className={cn(
                "absolute h-full w-full rounded-4xl object-cover",
                imageClassName,
              )}
              ref={(el) => {
                imageRefs.current[i] = el
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
