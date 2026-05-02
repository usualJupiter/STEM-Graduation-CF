"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group"

import Turnstile from "@/components/apply/turnstile"

interface ConfirmFormProps {
  declarationText: string
  turnstileSiteKey: string
  onSubmit: (turnstileToken: string) => void | Promise<void>
}

export default function ConfirmForm({
  declarationText,
  turnstileSiteKey,
  onSubmit,
}: ConfirmFormProps) {
  const [agreed, setAgreed] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!agreed || !token || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(token)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="w-full max-w-[562px] rounded-none border border-border bg-background"
    >
      <div className="flex flex-col gap-1.5 px-4 pt-4">
        <FieldSet>
          <FieldLegend className="text-right">تقديم الطلب</FieldLegend>
          <FieldDescription className="text-right">
            اقرأ الإقرار بجدية
          </FieldDescription>
        </FieldSet>
      </div>

      <div className="flex flex-col gap-5 p-4">
        <Field>
          <FieldLabel htmlFor="declaration" className="text-right">
            إقرار الترشح
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="declaration"
              readOnly
              value={declarationText}
              className="min-h-[120px] text-right"
            />
          </InputGroup>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="agree-checkbox"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <FieldLabel htmlFor="agree-checkbox" className="font-medium">
            أقر أنا الطالب أني قرأت الإقرار وقمت بالموافقة عليه
          </FieldLabel>
        </Field>

        <div className="flex justify-center">
          <Turnstile
            siteKey={turnstileSiteKey}
            onToken={(t) => setToken(t)}
            onExpire={() => setToken(null)}
          />
        </div>
      </div>

      <div className="flex items-start justify-between border-t border-border p-4">
        <Button
          type="button"
          className="w-full bg-defult-web text-main hover:bg-defult-web/90"
          onClick={handleSubmit}
          disabled={!agreed || !token || submitting}
        >
          {submitting ? "جارٍ الإرسال…" : "تقديم الطلب"}
        </Button>
      </div>
    </div>
  )
}
