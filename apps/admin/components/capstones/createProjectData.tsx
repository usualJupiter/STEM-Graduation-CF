"use client"

import { useTranslations } from "next-intl"

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
  "abstract",
  "introduction",
  "methodology",
  "analysis",
  "conclusion",
  "recommendations",
] as const

type SectionId = (typeof SECTIONS)[number]
type SectionFieldKey = `${SectionId}_en` | `${SectionId}_ar`

interface CreateProjectDataProps {
  value: CapstoneFormState
  onChange: (patch: Partial<CapstoneFormState>) => void
  errors?: FieldErrors
  onBack?: () => void
  onNext?: () => void
  title: string
  description: string
}

export default function CreateProjectData({
  value,
  onChange,
  errors = {},
  onBack,
  onNext,
  title,
  description,
}: CreateProjectDataProps) {
  const tData = useTranslations("Capstones.data")
  const tSubmit = useTranslations("Capstones.submit")

  const setField = (key: SectionFieldKey, val: string) => {
    if (val.length > MAX_CHARS) return
    onChange({ [key]: val } as Partial<CapstoneFormState>)
  }

  const renderColumn = (lang: "en" | "ar") => (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {SECTIONS.map((id) => {
        const fieldId = `${id}-${lang}`
        const key = `${id}_${lang}` as SectionFieldKey
        const v = value[key] as string
        const labelKey = lang === "ar" ? `labels.${id}Ar` : `labels.${id}`
        return (
          <Field key={fieldId}>
            <FieldLabel htmlFor={fieldId}>{tData(labelKey)}</FieldLabel>
            <InputGroup className="rounded-none">
              <InputGroupTextarea
                id={fieldId}
                className="min-h-16"
                value={v}
                onChange={(e) => setField(key, e.target.value)}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs text-muted-foreground">
                  {tData("characters", { count: v.length, max: MAX_CHARS })}
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
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid max-h-[60vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
        {renderColumn("en")}
        {renderColumn("ar")}
      </div>
      <DialogFooter className="border-t bg-muted/50 p-4">
        <Button variant="outline" onClick={onBack}>
          {tSubmit("back")}
        </Button>
        <Button
          onClick={onNext}
          className="min-w-32 bg-secondry-web text-white hover:bg-secondry-web/90"
        >
          {tSubmit("next")}
        </Button>
      </DialogFooter>
    </>
  )
}
