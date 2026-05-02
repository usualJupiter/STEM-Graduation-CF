"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { ChevronLeft } from "lucide-react"
import React from "react"

import { cn } from "@workspace/ui/lib/utils"

interface ProgressProps {
  step: 1 | 2 | 3 | 4
}

const STEPS = [
  { id: 1, label: "بيانات الطالب" },
  { id: 2, label: "الشهادة الدراسية" },
  { id: 3, label: "الملفات" },
  { id: 4, label: "الانهاء" },
] as const

export default function Progress({ step }: ProgressProps) {
  return (
    <div dir="rtl" className="inline-flex items-center rounded-lg bg-muted p-0.5">
      <Breadcrumb>
        <BreadcrumbList className="gap-1">
          {STEPS.map((s, idx) => {
            const isCurrent = s.id === step
            const isPast = s.id < step
            return (
              <React.Fragment key={s.id}>
                <BreadcrumbItem>
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "select-none rounded-md px-3 py-1.5 text-sm",
                      isCurrent && "bg-background text-foreground shadow-sm",
                      !isCurrent && isPast && "text-foreground",
                      !isCurrent && !isPast && "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </BreadcrumbItem>
                {idx < STEPS.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronLeft className="text-muted-foreground" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
