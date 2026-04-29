"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@workspace/ui/components/input-group"

import type { CapstoneFormState } from "@/components/capstones/types"
import type { FieldErrors } from "@/components/capstones/schemas"

const MAX_CHARS = 1024

const SECTIONS = [
  { id: "abstract", label: "Abstract" },
  { id: "introduction", label: "Introduction" },
  { id: "methodology", label: "Methodology" },
  { id: "analysis", label: "Analysis & Results" },
  { id: "conclusion", label: "Conclusion" },
  { id: "recommendations", label: "Recommendations" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]
type SectionFieldKey = `${SectionId}_en` | `${SectionId}_ar`

interface CreateProjectDataProps {
  value: CapstoneFormState
  onChange: (patch: Partial<CapstoneFormState>) => void
  errors?: FieldErrors
  onBack?: () => void
  onNext?: () => void
}

export default function CreateProjectData({
  value,
  onChange,
  errors = {},
  onBack,
  onNext,
}: CreateProjectDataProps) {
  const setField = (key: SectionFieldKey, val: string) => {
    if (val.length > MAX_CHARS) return
    onChange({ [key]: val } as Partial<CapstoneFormState>)
  }

  const renderColumn = (lang: "en" | "ar") => (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {SECTIONS.map((section) => {
        const fieldId = `${section.id}-${lang}`
        const key = `${section.id}_${lang}` as SectionFieldKey
        const v = value[key] as string
        const labelText =
          lang === "ar" ? `${section.label} AR` : section.label
        return (
          <Field key={fieldId}>
            <FieldLabel htmlFor={fieldId}>{labelText}</FieldLabel>
            <InputGroup className="rounded-none">
              <InputGroupTextarea
                id={fieldId}
                className="min-h-16"
                value={v}
                onChange={(e) => setField(key, e.target.value)}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs text-muted-foreground">
                  {v.length}/{MAX_CHARS} characters
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors[key] && (
              <p className="text-xs text-destructive">{errors[key]}</p>
            )}
          </Field>
        )
      })}
    </div>
  )

  return (
    <>
      <DialogHeader className="p-4">
        <DialogTitle>Create New Capstone</DialogTitle>
        <DialogDescription>Fill all info below.</DialogDescription>
      </DialogHeader>
      <div className="grid max-h-[60vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
        {renderColumn("en")}
        {renderColumn("ar")}
      </div>
      <DialogFooter className="border-t bg-muted/50 p-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          className="min-w-32 bg-secondry-web text-white hover:bg-secondry-web/90"
        >
          Next
        </Button>
      </DialogFooter>
    </>
  )
}
