"use client"

import { Button } from "@workspace/ui/components/button"

interface StepNavProps {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  backDisabled?: boolean
}

export default function StepNav({
  onBack,
  onNext,
  nextLabel = "التالي",
  nextDisabled = false,
  backDisabled = false,
}: StepNavProps) {
  return (
    <div className="flex items-start gap-3 border-t border-border p-4">
      {onBack && (
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={backDisabled}
        >
          السابق
        </Button>
      )}
      <Button
        type="button"
        className={`${onBack ? "flex-1" : "w-full"} bg-default-web text-main hover:bg-default-web/90`}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
      </Button>
    </div>
  )
}
