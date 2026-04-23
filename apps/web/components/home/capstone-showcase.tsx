"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useLocale, useTranslations } from "next-intl"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@workspace/ui/components/carousel"
import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"

interface Slide {
  id: number
  src: string
  title?: string
}

interface CapstoneShowProps {
  slides?: Slide[]
  autoplay?: boolean
  loop?: boolean
  showNavigation?: boolean
  showPagination?: boolean
  seeAllHref?: string
}

const DEFAULT_SLIDES: Slide[] = [
  { id: 1, src: "/assets/project1.jpg" },
  { id: 2, src: "/assets/prject2.jpg" },
  { id: 3, src: "/assets/project3.jpg" },
  { id: 4, src: "/assets/project4.jpg" },
  { id: 5, src: "/assets/project5.jpg" },
  { id: 6, src: "/assets/project6.jpg" },
]

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export default function CapstoneShow({
  slides = DEFAULT_SLIDES,
  autoplay = false,
  loop = true,
  showNavigation = true,
  showPagination = true,
  seeAllHref = "/capstones",
}: CapstoneShowProps) {
  const t = useTranslations("CapstoneShow")
  const locale = useLocale()
  const isRtl = locale === "ar"

  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const handleSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", handleSelect)
    handleSelect()
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
      className="w-full bg-white py-16 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-4 md:px-6">
        <motion.div variants={fadeUp}>
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-black bg-white px-3 py-1 text-sm font-medium text-black shadow-sm transition-colors hover:bg-black/5"
          >
            <span className="size-2 shrink-0 rounded-full bg-green-500" />
            {t("tagline")}
            <ArrowUpRight aria-hidden className="shrink-0 rtl:-scale-x-100" />
          </Link>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="max-w-[576px] text-center text-2xl font-semibold tracking-tight text-black md:text-4xl md:leading-10"
        >
          {t("heading")}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="max-w-[576px] text-center text-base text-black/70 md:text-lg md:leading-8"
        >
          {t("description")}
        </motion.p>
      </div>

      <motion.div variants={fadeUp} className="mt-8 w-full md:mt-12">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            loop,
            slidesToScroll: 1,
            direction: isRtl ? "rtl" : "ltr",
          }}
          plugins={
            autoplay
              ? [
                  Autoplay({
                    delay: 2000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]
              : []
          }
        >
          <CarouselContent className="h-[500px]">
            {slides.map((slide, index) => (
              <CarouselItem
                key={slide.id}
                className="relative flex h-[81.5%] basis-[73%] items-center justify-center sm:basis-[50%] md:basis-[30%] lg:basis-[25%] xl:basis-[21%]"
              >
                <motion.div
                  initial={false}
                  animate={{
                    clipPath:
                      current !== index
                        ? "inset(15% 0 15% 0 round 2rem)"
                        : "inset(0 0 0 0 round 2rem)",
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative h-full w-full overflow-hidden rounded-3xl"
                >
                  <Image
                    src={slide.src}
                    alt={t("slideAlt", { n: slide.id })}
                    fill
                    className="scale-105 object-cover"
                    sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 73vw"
                    unoptimized
                  />
                </motion.div>
                <AnimatePresence mode="wait">
                  {current === index && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(10px)" }}
                      transition={{ duration: 0.5 }}
                      className="absolute bottom-0 left-0 flex h-[14%] w-full translate-y-full items-center justify-center p-2 text-center text-sm font-medium tracking-tight text-black/60"
                    >
                      {slide.title ?? t("slideTitle", { n: slide.id })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CarouselItem>
            ))}
          </CarouselContent>

          {showNavigation && (
            <div className="pointer-events-none absolute inset-x-0 -bottom-4">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 md:px-6">
                <button
                  type="button"
                  aria-label={t("previous")}
                  onClick={() => api?.scrollPrev()}
                  className="pointer-events-auto rounded-full bg-black/20 p-2 text-white transition hover:bg-black/40"
                >
                  <PrevIcon className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label={t("next")}
                  onClick={() => api?.scrollNext()}
                  className="pointer-events-auto rounded-full bg-black/20 p-2 text-white transition hover:bg-black/40"
                >
                  <NextIcon className="size-5" />
                </button>
              </div>
            </div>
          )}

          {showPagination && (
            <div className="flex w-full items-center justify-center pt-10">
              <div className="flex items-center justify-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "size-2 cursor-pointer rounded-full transition-all",
                      current === index ? "bg-black" : "bg-[#D9D9D9]"
                    )}
                    aria-label={t("goToSlide", { n: index + 1 })}
                  />
                ))}
              </div>
            </div>
          )}
        </Carousel>
      </motion.div>
    </motion.section>
  )
}
