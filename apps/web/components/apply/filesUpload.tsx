"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"

const fileFields = [
  { id: "photo", label: "صورة شخصية 4x6" },
  { id: "certificate", label: "شهادة الثانوية العامة (صيغة PDF)" },
]

interface FilesUploadProps {
  onSubmit?: () => void
}

export default function FilesUpload({ onSubmit }: FilesUploadProps) {
  return (
    <div dir="rtl" className="w-full max-w-[562px] rounded-none border bg-background">
      <div className="flex flex-col gap-1.5 p-4 pb-0">
        <FieldSet>
          <FieldLegend>الملفات المطلوبة</FieldLegend>
          <FieldDescription>
            أملأ بياناتك بشكل صحيح في الحقول التالية
          </FieldDescription>
        </FieldSet>
      </div>

      <div className="flex flex-col gap-5 p-4">
        <FieldGroup className="flex flex-col gap-5">
          {fileFields.map((field) => (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Input id={field.id} type="file" />
            </Field>
          ))}
        </FieldGroup>
      </div>

      <div className="flex items-start justify-between border-t p-4">
        <Button
          className="w-full bg-defult-web text-main hover:bg-defult-web/90"
          onClick={onSubmit}
        >
          التالي
        </Button>
      </div>
    </div>
  )
}
