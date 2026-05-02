"use client"

import { useFormContext } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"

import type { ApplyValues } from "@/lib/applications"

interface TextFormFieldProps {
  name: keyof ApplyValues
  label: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
  format?: (value: string) => string
}

export default function TextFormField({
  name,
  label,
  placeholder,
  inputMode,
  maxLength,
  format,
}: TextFormFieldProps) {
  const form = useFormContext<ApplyValues>()
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
              inputMode={inputMode}
              maxLength={maxLength}
              placeholder={placeholder}
              className="text-right"
              onChange={(e) => {
                const next = format ? format(e.target.value) : e.target.value
                field.onChange(next)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
