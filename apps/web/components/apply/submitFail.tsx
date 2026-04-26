"use client"

import { CircleOff } from "lucide-react"
import Link from "next/link"

interface SubmitFailProps {
  title?: string
  linkText?: string
  linkHref?: string
}

export default function SubmitFail({
  title = "حدث خطأ",
  linkText = "العودة للموقع الرسمي",
  linkHref = "/",
}: SubmitFailProps) {
  return (
    <div
      dir="rtl"
      className="flex w-full flex-1 flex-col items-center justify-center gap-5 bg-muted px-4 py-12 text-foreground"
    >
      <div className="flex max-w-xl flex-col items-center gap-5">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        <Link
          href={linkHref}
          className="text-center text-lg text-muted-foreground hover:underline"
        >
          {linkText}
        </Link>
      </div>
      <CircleOff
        className="size-32 shrink-0 text-destructive sm:size-[180px]"
        strokeWidth={1.5}
      />
    </div>
  )
}
