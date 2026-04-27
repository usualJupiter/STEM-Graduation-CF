"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { ArrowUpRight } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { useLocale, useTranslations } from "next-intl"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@workspace/ui/components/carousel"
import { cn } from "@workspace/ui/lib/utils"

import { Link } from "@/i18n/navigation"

const SLIDES = [
  "https://cdn.stem-program.com/assets/project1.jpg",
  "https://cdn.stem-program.com/assets/project2.jpg",
  "https://cdn.stem-program.com/assets/project3.jpg",
  "https://cdn.stem-program.com/assets/project4.jpg",
  "https://cdn.stem-program.com/assets/project5.jpg",
  "https://cdn.stem-program.com/assets/project6.jpg",
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

export default function CapstoneShow() {
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
            href="/capstones"
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
            loop: true,
            slidesToScroll: 1,
            direction: isRtl ? "rtl" : "ltr",
          }}
          plugins={[
            Autoplay({
              delay: 2000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
        >
          <CarouselContent className="h-[500px]">
            {SLIDES.map((src, index) => (
              <CarouselItem
                key={src}
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
                    src={src}
                    alt={t("slideAlt", { n: index + 1 })}
                    fill
                    className="scale-105 object-cover"
                    sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 73vw"
                    unoptimized
                  />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex w-full items-center justify-center pt-10">
            <div className="flex items-center justify-center gap-2">
              {SLIDES.map((src, index) => (
                <button
                  key={src}
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
        </Carousel>
      </motion.div>
    </motion.section>
  )
}
