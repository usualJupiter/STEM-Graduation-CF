"use client"

import { useFormContext } from "react-hook-form"

import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"

import StepCard from "@/components/apply/stepCard"
import StepNav from "@/components/apply/stepNav"
import TextFormField from "@/components/apply/textFormField"
import {
  ageOnNextOctober,
  digitsOnly,
  formatDateDDMMYYYY,
  formatDateMMYYYY,
  type ApplyValues,
} from "@/lib/applications"

interface StudentInfoProps {
  onNext: () => void
}

type FieldConfig = {
  name: keyof ApplyValues
  label: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
  format?: (value: string) => string
}

const FIELDS: FieldConfig[] = [
  { name: "name", label: "الاسم" },
  { name: "nationality", label: "الجنسية" },
  { name: "religion", label: "الديانة" },
  { name: "residence", label: "محل الإقامة" },
  {
    name: "home_phone",
    label: "رقم هاتف المنزل",
    placeholder: "088XXXXXXX",
    inputMode: "numeric",
    maxLength: 10,
    format: digitsOnly,
  },
  {
    name: "mobile",
    label: "محمول",
    placeholder: "01XXXXXXXXX",
    inputMode: "numeric",
    maxLength: 11,
    format: digitsOnly,
  },
  {
    name: "birthdate",
    label: "تاريخ الميلاد",
    placeholder: "DD/MM/YYYY",
    inputMode: "numeric",
    maxLength: 10,
    format: formatDateDDMMYYYY,
  },
  { name: "birthplace", label: "جهة الميلاد" },
  {
    name: "national_id",
    label: "رقم بطاقة الرقم القومي",
    inputMode: "numeric",
    maxLength: 14,
    format: digitsOnly,
  },
  { name: "id_issuing_authority", label: "جهة الإصدار" },
  {
    name: "id_issue_date",
    label: "تاريخ الإصدار",
    placeholder: "MM/YYYY",
    inputMode: "numeric",
    maxLength: 7,
    format: formatDateMMYYYY,
  },
  { name: "guardian_name", label: "أسم ولي الأمر" },
  { name: "guardian_job", label: "وظيفته" },
  { name: "guardian_address", label: "عنوان ولي الأمر" },
  {
    name: "guardian_mobile",
    label: "محمول ولي الأمر",
    placeholder: "01XXXXXXXXX",
    inputMode: "numeric",
    maxLength: 11,
    format: digitsOnly,
  },
]

export default function StudentInfo({ onNext }: StudentInfoProps) {
  const form = useFormContext<ApplyValues>()
  const birthdate = form.watch("birthdate")
  const computedAge =
    typeof birthdate === "string" ? ageOnNextOctober(birthdate) : null

  return (
    <StepCard>
      <FieldSet>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <FieldLegend>بيانات الطالب</FieldLegend>
          <FieldDescription>
            املأ بياناتك بشكل صحيح في الحقول التالية
          </FieldDescription>
        </div>

        <div className="flex flex-col gap-5 p-4">
          {FIELDS.map((f) => (
            <div key={f.name} className="flex flex-col gap-2">
              <TextFormField
                name={f.name}
                label={f.label}
                placeholder={f.placeholder}
                inputMode={f.inputMode}
                maxLength={f.maxLength}
                format={f.format}
              />
              {f.name === "birthdate" && computedAge !== null && (
                <p className="text-sm text-muted-foreground">
                  السن في أول أكتوبر القادم: {computedAge} سنة
                </p>
              )}
            </div>
          ))}
        </div>
      </FieldSet>

      <StepNav onNext={onNext} />
    </StepCard>
  )
}
