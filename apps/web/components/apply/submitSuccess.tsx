"use client"

import Link from "next/link"
import { CircleCheckBig } from "lucide-react"

interface SubmitSuccessProps {
  title?: string
  linkText?: string
  linkHref?: string
}

export default function SubmitSuccess({
  title = "تم تقديم طلبك بنجاح",
  linkText = "العودة للموقع الرسمي",
  linkHref = "/",
}: SubmitSuccessProps) {
  return (
    <div
      dir="rtl"
      className="flex w-full flex-1 flex-col items-center justify-center gap-5 bg-muted px-4 py-12 text-foreground"
    >
      <CircleCheckBig className="size-36 text-green-500 sm:size-44" strokeWidth={1.2} />
      <div className="flex max-w-xl flex-col items-center gap-5">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-10">
          {title}
        </h1>
        <Link
          href={linkHref}
          className="text-center text-base text-muted-foreground hover:underline sm:text-lg sm:leading-8"
        >
          {linkText}
        </Link>
      </div>
    </div>
  )
}
