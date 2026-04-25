"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { useLocale } from "next-intl"
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"

import { Link } from "@/i18n/navigation"

export type CapstoneCarouselItem = {
  id: string
  src: string
  alt: string
}

interface CapstoneCarouselProps {
  items: CapstoneCarouselItem[]
  autoplay?: boolean
  loop?: boolean
}

const css = `
.capstone-carousel {
  padding-bottom: 50px !important;
}
.capstone-carousel .swiper-pagination-bullet-active {
  background: var(--color-primary, #000);
}
`

export function CapstoneCarousel({
  items,
  autoplay = false,
  loop = true,
}: CapstoneCarouselProps) {
  const locale = useLocale()
  const isRtl = locale === "ar"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative w-full"
    >
      <style>{css}</style>

      <Swiper
        key={isRtl ? "rtl" : "ltr"}
        dir={isRtl ? "rtl" : "ltr"}
        spaceBetween={40}
        autoplay={
          autoplay
            ? { delay: 1500, disableOnInteraction: false }
            : false
        }
        effect="coverflow"
        grabCursor
        centeredSlides
        loop={loop}
        slidesPerView={1.4}
        breakpoints={{
          640: { slidesPerView: 1.8 },
          1024: { slidesPerView: 2.43 },
        }}
        coverflowEffect={{
          rotate: 0,
          slideShadows: false,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="capstone-carousel"
      >
        {items.map((item) => (
          <SwiperSlide
            key={item.id}
            className="!h-[320px] w-full overflow-hidden rounded-2xl border border-primary/10"
          >
            <Link
              href={`/capstones/${item.id}`}
              className="relative block h-full w-full"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 80vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
                unoptimized
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  )
}
