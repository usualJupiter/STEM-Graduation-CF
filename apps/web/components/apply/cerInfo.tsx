"use client"

import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"

import StepCard from "@/components/apply/stepCard"
import StepNav from "@/components/apply/stepNav"
import TextFormField from "@/components/apply/textFormField"
import type { ApplyValues } from "@/lib/applications"

interface CerInfoProps {
  onNext: () => void
  onBack: () => void
}

const FIELDS: Array<{
  name: keyof ApplyValues
  label: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}> = [
  { name: "certificate", label: "الشهادة الدراسية الحاصل عليها" },
  { name: "graduation_year", label: "سنة التخرج", inputMode: "numeric" },
  { name: "total_grades", label: "المجموع الكلي للدرجات", inputMode: "numeric" },
  { name: "first_language", label: "اللغة الأجنبية الأولى" },
  { name: "second_language", label: "اللغة الأجنبية الثانية" },
  { name: "school", label: "المدرسة الحاصل منها على الثانوية العامة" },
  { name: "division", label: "الشعبة" },
  { name: "educational_district", label: "المنطقة التعليمية" },
  { name: "governorate", label: "المحافظة" },
]

export default function CerInfo({ onNext, onBack }: CerInfoProps) {
  return (
    <StepCard>
      <FieldSet>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <FieldLegend>بيانات الشهادة الدراسية</FieldLegend>
          <FieldDescription>
            املأ بياناتك بشكل صحيح في الحقول التالية
          </FieldDescription>
        </div>

        <div className="flex flex-col gap-5 p-4">
          {FIELDS.map((f) => (
            <TextFormField
              key={f.name}
              name={f.name}
              label={f.label}
              inputMode={f.inputMode}
            />
          ))}
        </div>
      </FieldSet>

      <StepNav onBack={onBack} onNext={onNext} />
    </StepCard>
  )
}
