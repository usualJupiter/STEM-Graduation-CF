"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@workspace/ui/components/carousel"
import { cn } from "@workspace/ui/lib/utils"

const PLACEHOLDER_SRC = "https://ui.shadcn.com/placeholder.svg"
const SLIDE_COUNT = 6

interface Slide {
  id: number
  src: string
}

interface CapstoneShowProps {
  slides?: Slide[]
}

const DEFAULT_SLIDES: Slide[] = Array.from({ length: SLIDE_COUNT }, (_, i) => ({
  id: i + 1,
  src: PLACEHOLDER_SRC,
}))

export default function CapstoneShow({
  slides = DEFAULT_SLIDES,
}: CapstoneShowProps) {
  const t = useTranslations("CapstoneShow")
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 md:gap-12 md:px-6">
        <div className="flex w-full flex-col items-center gap-5">
          <p className="text-sm font-medium text-black/70">{t("tagline")}</p>
          <h2 className="max-w-[576px] text-center text-2xl font-semibold tracking-tight text-black md:text-4xl md:leading-10">
            {t("heading")}
          </h2>
          <p className="max-w-[576px] text-center text-base text-black/70 md:text-lg md:leading-8">
            {t("description")}
          </p>
        </div>

        <div className="w-full">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {slides.map((slide) => (
                <CarouselItem key={slide.id}>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={slide.src}
                      alt={t("slideAlt", { n: slide.id })}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 1200px, 100vw"
                      unoptimized
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          <div className="flex items-center justify-center gap-2 py-4">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t("goToSlide", { n: index + 1 })}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  index === current ? "bg-black" : "bg-black/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
