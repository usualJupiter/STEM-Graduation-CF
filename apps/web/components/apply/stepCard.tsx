"use client"

import type { ReactNode } from "react"

interface StepCardProps {
  children: ReactNode
}

export default function StepCard({ children }: StepCardProps) {
  return (
    <div
      dir="rtl"
      className="w-full max-w-[562px] rounded-none border border-border bg-background"
    >
      {children}
    </div>
  )
}
