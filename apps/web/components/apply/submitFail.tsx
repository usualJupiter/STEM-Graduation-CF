"use client"

import { CircleOff } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

interface SubmitFailProps {
  title?: string
  linkText?: string
  linkHref?: string
  onRetry?: () => void
}

export default function SubmitFail({
  title = "حدث خطأ",
  linkText = "العودة للموقع الرسمي",
  linkHref = "/",
  onRetry,
}: SubmitFailProps) {
  return (
    <div
      dir="rtl"
      className="flex w-full flex-1 flex-col items-center justify-center gap-5 bg-muted px-4 py-12 text-foreground"
    >
      <CircleOff
        className="size-32 shrink-0 text-destructive sm:size-[180px]"
        strokeWidth={1.5}
      />
      <div className="flex max-w-xl flex-col items-center gap-5">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
          >
            {linkText}
          </Button>
        ) : (
          <Link
            href={linkHref}
            className="text-center text-lg text-muted-foreground hover:underline"
          >
            {linkText}
          </Link>
        )}
      </div>
    </div>
  )
}
