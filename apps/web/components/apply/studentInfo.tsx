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

interface StudentInfoProps {
  onNext?: () => void
}

const FORM_FIELDS = [
  { id: "name", label: "الاسم" },
  { id: "nationality", label: "الجنسية" },
  { id: "religion", label: "الديانة" },
  { id: "residence", label: "محل الاقامة" },
  { id: "home-phone", label: "رقم هاتف المنزل" },
  { id: "mobile", label: "محمول" },
  { id: "birthdate", label: "تاريخ الميلاد" },
  { id: "birthplace", label: "جهة الميلاد" },
  { id: "age-october", label: "السن في أول اكتوبر القادم" },
  { id: "national-id", label: "رقم بطاقة الرقم القومي" },
  { id: "issuing-authority", label: "جهة الأصدار" },
  { id: "issue-date", label: "تاريخ الاصدار" },
  { id: "guardian-name", label: "أسم ولى الأمر" },
  { id: "guardian-job", label: "وظيفته" },
  { id: "guardian-address", label: "عنوان ولي الأمر" },
  { id: "guardian-mobile", label: "محمول ولي الأمر" },
]

export default function StudentInfo({ onNext }: StudentInfoProps) {
  return (
    <div dir="rtl" className="w-full max-w-[562px] rounded-none border border-border bg-background">
      <FieldSet>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <FieldLegend>بيانات الطالب</FieldLegend>
          <FieldDescription>
            أملأ بياناتك بشكل صحيح في الحقول التالية
          </FieldDescription>
        </div>

        <FieldGroup className="flex flex-col gap-5 p-4">
          {FORM_FIELDS.map((field) => (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Input id={field.id} className="text-right" />
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
