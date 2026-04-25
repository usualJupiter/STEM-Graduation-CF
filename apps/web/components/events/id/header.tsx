"use client"

import Image from "next/image"

interface HeaderProps {
  title?: string
}

export default function Header({
  title = "Awareness event about sustainability and recycling",
}: HeaderProps) {
  return (
    <section className="w-full bg-[#110A43]">
      <div className="mx-auto flex max-w-[1280px] flex-col-reverse items-center justify-between gap-6 px-6 py-8 md:flex-row md:gap-0 md:py-0">
        <div className="flex w-full flex-col justify-end md:max-w-[689px]">
          <h1 className="text-2xl font-bold leading-none tracking-tight text-background sm:text-3xl md:text-4xl">
            {title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center justify-center p-2.5">
          <Image
            src="/assets/event1.jpg"
            alt="Hero illustration about sustainability and recycling"
            width={294}
            height={270}
            className="h-auto w-48 sm:w-56 md:w-[294px]"
          />
        </div>
      </div>
    </section>
  )
}
