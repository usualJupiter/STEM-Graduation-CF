"use client"

import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel } from "@workspace/ui/components/field"

import type { CapstoneFormState } from "@/components/capstones/types"
import type { FieldErrors } from "@/components/capstones/schemas"

interface CreateProjectResourcesProps {
  value: CapstoneFormState
  onChange: (patch: Partial<CapstoneFormState>) => void
  errors?: FieldErrors
  onBack?: () => void
  onSubmit?: () => void
  submitting?: boolean
  error?: string | null
  submitLabel: string
  submittingLabel: string
  title: string
  description: string
}

export default function CreateProjectResources({
  value,
  onChange,
  errors = {},
  onBack,
  onSubmit,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  title,
  description,
}: CreateProjectResourcesProps) {
  const tStep = useTranslations("Capstones.resourcesStep")
  const tSubmit = useTranslations("Capstones.submit")

  return (
    <>
      <DialogHeader className="p-4">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <Field>
          <FieldLabel htmlFor="poster-link">
            {tStep("posterLink")}
          </FieldLabel>
          <Input
            id="poster-link"
            dir="ltr"
            value={value.poster_link}
            onChange={(e) => onChange({ poster_link: e.target.value })}
            className="rounded-none"
          />
          {errors.poster_link && (
            <p className="text-xs text-destructive">{errors.poster_link}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="portfolio-link">
            {tStep("portfolioLink")}
          </FieldLabel>
          <Input
            id="portfolio-link"
            dir="ltr"
            value={value.portfolio_link}
            onChange={(e) => onChange({ portfolio_link: e.target.value })}
            className="rounded-none"
          />
          {errors.portfolio_link && (
            <p className="text-xs text-destructive">{errors.portfolio_link}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="presentation-link">
            {tStep("presentationLink")}
          </FieldLabel>
          <Input
            id="presentation-link"
            dir="ltr"
            value={value.presentation_link}
            onChange={(e) => onChange({ presentation_link: e.target.value })}
            className="rounded-none"
          />
          {errors.presentation_link && (
            <p className="text-xs text-destructive">
              {errors.presentation_link}
            </p>
          )}
        </Field>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter className="border-t border-border bg-muted p-4">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          {tSubmit("back")}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="min-w-32 bg-secondry-web text-white hover:bg-secondry-web/90"
        >
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </>
  )
}
