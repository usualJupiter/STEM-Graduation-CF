"use client"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldLabel,
  FieldGroup,
} from "@workspace/ui/components/field"

const formFields = [
  { id: "certificate", label: "الشهادة الدراسية الحاصل عليها" },
  { id: "graduation-year", label: "سنة التخرج" },
  { id: "total-grades", label: "المجموع الكلي للدرجات" },
  { id: "first-language", label: "اللغة الاجنبية الأولي" },
  { id: "second-language", label: "اللغة الاجنبية الثانية" },
  { id: "school", label: "المدرسة الحاصل منها علي الثانوية العامة" },
  { id: "division", label: "الشعبة" },
  { id: "educational-district", label: "المنطقة التعليمية" },
  { id: "governorate", label: "المحافظة" },
]

interface CerInfoProps {
  onNext?: () => void
}

export default function CerInfo({ onNext }: CerInfoProps) {
  return (
    <div dir="rtl" className="w-full max-w-[562px] rounded-none border border-border bg-background">
      <FieldSet>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <FieldLegend>بيانات الشهادة الدراسية</FieldLegend>
          <FieldDescription>أملأ بياناتك بشكل صحيح في الحقول التالية</FieldDescription>
        </div>

        <FieldGroup className="flex flex-col gap-5 p-4">
          {formFields.map((field) => (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Input id={field.id} />
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>

      <div className="flex items-start justify-between border-t border-border p-4">
        <Button
          className="w-full bg-defult-web text-main hover:bg-defult-web/90"
          onClick={onNext}
        >
          التالي
        </Button>
      </div>
    </div>
  )
}
