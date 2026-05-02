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

import type { ApplyValues } from "@/lib/applications"

interface CerInfoProps {
  onNext: () => void
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

export default function CerInfo({ onNext }: CerInfoProps) {
  const form = useFormContext<ApplyValues>()
  return (
    <Form {...form}>
      <div
        dir="rtl"
        className="w-full max-w-[562px] rounded-none border border-border bg-background"
      >
        <FieldSet>
          <div className="flex flex-col gap-1.5 p-4 pb-0">
            <FieldLegend>بيانات الشهادة الدراسية</FieldLegend>
            <FieldDescription>
              املأ بياناتك بشكل صحيح في الحقول التالية
            </FieldDescription>
          </div>

          <div className="flex flex-col gap-5 p-4">
            {FIELDS.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={typeof field.value === "string" ? field.value : ""}
                        inputMode={f.inputMode}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
