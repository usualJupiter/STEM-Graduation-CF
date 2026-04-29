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

interface CreateProjectResourcesProps {
  value: CapstoneFormState
  onChange: (patch: Partial<CapstoneFormState>) => void
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
            value={value.poster_link}
            onChange={(e) => onChange({ poster_link: e.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="portfolio-link">
            {tStep("portfolioLink")}
          </FieldLabel>
          <Input
            id="portfolio-link"
            value={value.portfolio_link}
            onChange={(e) => onChange({ portfolio_link: e.target.value })}
            className="rounded-none"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="presentation-link">
            {tStep("presentationLink")}
          </FieldLabel>
          <Input
            id="presentation-link"
            value={value.presentation_link}
            onChange={(e) => onChange({ presentation_link: e.target.value })}
            className="rounded-none"
          />
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
