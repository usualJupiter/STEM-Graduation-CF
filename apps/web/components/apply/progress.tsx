"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft } from "lucide-react"
import React from "react"

interface ProgressProps {
  step: 1 | 2 | 3 | 4
  onStepChange?: (step: 1 | 2 | 3 | 4) => void
}

const STEPS = [
  { id: 1, label: "بيانات الطالب" },
  { id: 2, label: "الشهادة الدراسية" },
  { id: 3, label: "الملفات" },
  { id: 4, label: "الانهاء" },
] as const

export default function Progress({ step, onStepChange }: ProgressProps) {
  return (
    <div dir="rtl" className="inline-flex items-center rounded-lg bg-muted p-0.5">
      <Breadcrumb>
        <BreadcrumbList className="gap-1">
          {STEPS.map((s, idx) => {
            const isCurrent = s.id === step
            return (
              <React.Fragment key={s.id}>
                <BreadcrumbItem>
                  <Button
                    variant={isCurrent ? "outline" : "ghost"}
                    aria-current={isCurrent ? "step" : undefined}
                    onClick={() => onStepChange?.(s.id)}
                  >
                    {s.label}
                  </Button>
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
