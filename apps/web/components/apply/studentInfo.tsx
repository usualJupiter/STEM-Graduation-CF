"use client"

import { useFormContext } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"

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
    <Form {...form}>
      <div
        dir="rtl"
        className="w-full max-w-[562px] rounded-none border border-border bg-background"
      >
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
                <FormField
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={
                            typeof field.value === "string" ? field.value : ""
                          }
                          inputMode={f.inputMode}
                          maxLength={f.maxLength}
                          placeholder={f.placeholder}
                          className="text-right"
                          onChange={(e) => {
                            const next = f.format
                              ? f.format(e.target.value)
                              : e.target.value
                            field.onChange(next)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

        <div className="flex items-start justify-between border-t border-border p-4">
          <Button
            type="button"
            className="w-full bg-defult-web text-main hover:bg-defult-web/90"
            onClick={onNext}
          >
            التالي
          </Button>
        </div>
      </div>
    </Form>
  )
}
