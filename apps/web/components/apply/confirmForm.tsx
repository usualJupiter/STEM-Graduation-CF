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

const DECLARATION_TEXT =
  "أقر انا الطالب المرشح للقبول بكلية التربية جامعة أسيوط في العام الجامعة 2025/2026 بأنني تقدمت بملف اوراقي للكلية بناء علي بطاقة الترشيح وأنني علي علم تام بعدم وجود كشوف بأسماء الطلاب المرشحين للكلية من مكتب التنسيق القبول بالجامعات والمعاهد وانه في حاله وصول الكشوف النهائية بعد اعلان نتيجة التحويلات الالكترونية ولم يرد فيها اسمي وبياناتي يصبح قيدي بالكلية لاغيا دون ادني مسؤلية علي الكلية"

interface ConfirmFormProps {
  onSubmit?: () => void
}

export default function ConfirmForm({ onSubmit }: ConfirmFormProps) {
  const [agreed, setAgreed] = useState(true)

  return (
    <div dir="rtl" className="w-full max-w-[562px] rounded-none border border-border bg-background">
      <div className="flex flex-col gap-1.5 px-4 pt-4">
        <FieldSet>
          <FieldLegend className="text-right">تقديم الطلب</FieldLegend>
          <FieldDescription className="text-right">
            أقرأ الأقرار بجديه
          </FieldDescription>
        </FieldSet>
      </div>

      <div className="flex flex-col gap-5 p-4">
        <Field>
          <FieldLabel htmlFor="declaration" className="text-right">
            أقرار الترشح
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="declaration"
              readOnly
              value={DECLARATION_TEXT}
              className="min-h-[100px] text-right"
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
            أقر انا الطالب اني قرأت الاقرار وقمت بالموافقة عليه
          </FieldLabel>
        </Field>
      </div>

      <div className="flex items-start justify-between border-t border-border p-4">
        <Button
          className="w-full bg-defult-web text-main hover:bg-defult-web/90"
          onClick={onSubmit}
          disabled={!agreed}
        >
          تقديم الطلب
        </Button>
      </div>
    </div>
  )
}
