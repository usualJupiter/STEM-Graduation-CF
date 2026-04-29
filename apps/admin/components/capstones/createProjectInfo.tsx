"use client"

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@workspace/ui/components/tags-input"

import type { CapstoneFormState } from "@/components/capstones/types"
import type { FieldErrors } from "@/components/capstones/schemas"

interface CreateProjectInfoProps {
  value: CapstoneFormState
  onChange: (patch: Partial<CapstoneFormState>) => void
  errors?: FieldErrors
  onNext?: () => void
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

function TagsField({
  id,
  label,
  description,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  description?: string
  value: string[]
  onChange: (next: string[]) => void
  error?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <TagsInput value={value} onValueChange={onChange}>
        <TagsInputList className="rounded-none">
          {value.map((tag) => (
            <TagsInputItem key={tag} value={tag}>
              {tag}
            </TagsInputItem>
          ))}
          <TagsInputInput id={id} />
        </TagsInputList>
      </TagsInput>
      {description && <FieldDescription>{description}</FieldDescription>}
      <ErrorText message={error} />
    </Field>
  )
}

export default function CreateProjectInfo({
  value,
  onChange,
  errors = {},
  onNext,
}: CreateProjectInfoProps) {
  return (
    <>
      <DialogHeader className="p-4">
        <DialogTitle>Create New Capstone</DialogTitle>
        <DialogDescription>Fill all info below.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
          <Field>
            <FieldLabel htmlFor="title-en">Project Title</FieldLabel>
            <Input
              id="title-en"
              value={value.title_en}
              onChange={(e) => onChange({ title_en: e.target.value })}
              className="rounded-none"
            />
            <ErrorText message={errors.title_en} />
          </Field>
          <Field>
            <FieldLabel htmlFor="full-name-en">Project Full Name</FieldLabel>
            <Input
              id="full-name-en"
              value={value.full_name_en}
              onChange={(e) => onChange({ full_name_en: e.target.value })}
              className="rounded-none"
            />
            <ErrorText message={errors.full_name_en} />
          </Field>
          <Field>
            <FieldLabel htmlFor="level">Level</FieldLabel>
            <Select
              value={value.level}
              onValueChange={(v) => onChange({ level: v })}
            >
              <SelectTrigger id="level" className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
            <ErrorText message={errors.level} />
          </Field>
          <TagsField
            id="students-en"
            label="Students"
            description="Press enter after each name"
            value={value.students_en}
            onChange={(v) => onChange({ students_en: v })}
            error={errors.students_en}
          />
          <TagsField
            id="supervisors-en"
            label="Supervisors"
            description="Press enter after each name"
            value={value.supervisors_en}
            onChange={(v) => onChange({ supervisors_en: v })}
            error={errors.supervisors_en}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
          <Field>
            <FieldLabel htmlFor="title-ar">Project Title AR</FieldLabel>
            <Input
              id="title-ar"
              value={value.title_ar}
              onChange={(e) => onChange({ title_ar: e.target.value })}
              className="rounded-none"
            />
            <ErrorText message={errors.title_ar} />
          </Field>
          <Field>
            <FieldLabel htmlFor="full-name-ar">Project Full Name AR</FieldLabel>
            <Input
              id="full-name-ar"
              value={value.full_name_ar}
              onChange={(e) => onChange({ full_name_ar: e.target.value })}
              className="rounded-none"
            />
            <ErrorText message={errors.full_name_ar} />
          </Field>
          <Field>
            <FieldLabel htmlFor="semester">Semester</FieldLabel>
            <Select
              value={value.semester}
              onValueChange={(v) => onChange({ semester: v })}
            >
              <SelectTrigger id="semester" className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First</SelectItem>
                <SelectItem value="second">Second</SelectItem>
              </SelectContent>
            </Select>
            <ErrorText message={errors.semester} />
          </Field>
          <TagsField
            id="students-ar"
            label="Students AR"
            description="Press enter after each name"
            value={value.students_ar}
            onChange={(v) => onChange({ students_ar: v })}
            error={errors.students_ar}
          />
          <TagsField
            id="supervisors-ar"
            label="Supervisors AR"
            description="Press enter after each name"
            value={value.supervisors_ar}
            onChange={(v) => onChange({ supervisors_ar: v })}
            error={errors.supervisors_ar}
          />
        </div>
      </div>
      <DialogFooter className="border-t bg-muted/50 p-4">
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
