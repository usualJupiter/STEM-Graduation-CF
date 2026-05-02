"use client"

import { useState } from "react"

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

import StepCard from "@/components/apply/stepCard"
import StepNav from "@/components/apply/stepNav"
import Turnstile from "@/components/apply/turnstile"

interface ConfirmFormProps {
  turnstileSiteKey: string
  declarationText: string
  onSubmit: (turnstileToken: string) => void | Promise<void>
  onBack: () => void
}

export default function ConfirmForm({
  turnstileSiteKey,
  declarationText,
  onSubmit,
  onBack,
}: ConfirmFormProps) {
  const [agreed, setAgreed] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [turnstileError, setTurnstileError] = useState(false)

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
    <StepCard>
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

        <div className="flex flex-col items-center gap-2">
          <Turnstile
            siteKey={turnstileSiteKey}
            onToken={(t) => {
              setToken(t)
              setTurnstileError(false)
            }}
            onExpire={() => setToken(null)}
            onError={() => {
              setToken(null)
              setTurnstileError(true)
            }}
          />
          {turnstileError && (
            <p className="text-sm text-destructive">
              تعذّر تحميل التحقق، يرجى تحديث الصفحة والمحاولة مرة أخرى
            </p>
          )}
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel={submitting ? "جارٍ الإرسال…" : "تقديم الطلب"}
        nextDisabled={!agreed || !token || submitting}
        backDisabled={submitting}
      />
    </StepCard>
  )
}
