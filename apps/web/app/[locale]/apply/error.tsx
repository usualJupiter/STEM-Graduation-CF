"use client"

import { useEffect } from "react"

import { Button } from "@workspace/ui/components/button"

export default function ApplyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      dir="rtl"
      className="flex w-full flex-1 flex-col items-center justify-center gap-5 bg-muted px-4 py-12 text-foreground"
    >
      <div className="flex max-w-xl flex-col items-center gap-5">
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-4xl sm:leading-10">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-center text-base text-muted-foreground sm:text-lg">
          يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، تواصل مع إدارة البرنامج.
        </p>
        <Button type="button" variant="outline" onClick={reset}>
          إعادة المحاولة
        </Button>
      </div>
    </div>
  )
}
