"use client"

import { HoverExpand, type HoverExpandItem } from "./hover-expand"

interface EventProps {
  title?: string
  description?: string
  location?: string
  date?: string
  time?: string
  images?: HoverExpandItem[]
}

const DEFAULT_IMAGES: HoverExpandItem[] = [
  { src: "/assets/event1.jpg", alt: "Event photo 1" },
  { src: "/assets/event2.jpg", alt: "Event photo 2" },
  { src: "/assets/event3.jpg", alt: "Event photo 3" },
]

export default function Event({
  title = "Title : Awareness event about sustainability and recycling",
  description = "It is presented by students of the STEM Level 4 program (Chemistry major), as part of the program's efforts to spread the culture of sustainable development and safe handling of technical waste.",
  location = "Asyut University, Faculty of Education square",
  date = "21 / 04 / 2026",
  time = "08:00 AM",
  images = DEFAULT_IMAGES,
}: EventProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-10 bg-white px-6 py-10 lg:flex-row lg:px-20 lg:py-10">
      <div className="flex min-w-0 max-w-2xl flex-col gap-10">
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold leading-none tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-lg leading-8 text-foreground/80">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-lg leading-8 text-foreground/80">
            Location: {location}
            <br />
            Date: {date}
            <br />
            Time: {time}
          </p>
        </div>
      </div>
      <div className="w-full max-w-[380px] shrink-0">
        <HoverExpand items={images} />
      </div>
    </section>
  )
}
