"use client"

import React from "react"

interface ApplyClosedProps {
  tagline?: string
  heading?: string
  description?: string
}

export default function ApplyClosed({
  tagline = "التقديم للبرنامج",
  heading = "التقديم للبرنامج لم يبدأ بعد",
  description = "قم بزيارة هذه الصفحة لاحقًا",
}: ApplyClosedProps) {
  return (
    <section
      dir="rtl"
      className="flex w-full flex-1 items-center justify-center bg-muted px-4 py-16"
    >
      <div className="flex max-w-xl flex-col items-center gap-5">
        <span className="text-sm font-medium text-muted-foreground">
          {tagline}
        </span>
        <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl md:leading-10">
          {heading}
        </h1>
        <p className="text-center text-base text-muted-foreground md:text-lg md:leading-8">
          {description}
        </p>
      </div>
    </section>
  )
}
