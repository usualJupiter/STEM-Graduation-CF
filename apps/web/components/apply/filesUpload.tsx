"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { FileText, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
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

import StepCard from "@/components/apply/stepCard"
import StepNav from "@/components/apply/stepNav"
import { type ApplyValues, formatBytes } from "@/lib/applications"

interface FilesUploadProps {
  onNext: () => void
  onBack: () => void
}

function MiddleTruncate({ text, tailChars = 7 }: { text: string; tailChars?: number }) {
  const head = text.length > tailChars + 4 ? text.slice(0, -tailChars) : text
  const tail = text.length > tailChars + 4 ? text.slice(-tailChars) : ""
  return (
    <span dir="ltr" className="flex min-w-0 font-medium">
      <span className="truncate">{head}</span>
      {tail && <span className="shrink-0">{tail}</span>}
    </span>
  )
}

export default function FilesUpload({ onNext, onBack }: FilesUploadProps) {
  const form = useFormContext<ApplyValues>()
  const photo = form.watch("photo") as File | undefined
  const cert = form.watch("certificate_file") as File | undefined

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  useEffect(() => {
    if (!(photo instanceof File)) return
    const url = URL.createObjectURL(photo)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL lifetime must be tied to the photo file
    setPhotoPreview(url)
    return () => {
      URL.revokeObjectURL(url)
      setPhotoPreview(null)
    }
  }, [photo])

  return (
    <StepCard>
      <FieldSet>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <FieldLegend>الملفات المطلوبة</FieldLegend>
          <FieldDescription>
            ارفق صورتك الشخصية وشهادة الثانوية بصيغة PDF
          </FieldDescription>
        </div>

        <div className="flex flex-col gap-5 p-4">
          <FormField
            control={form.control}
            name="photo"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel>صورة شخصية 4×6 (PNG / JPEG، أقل من 1 ميجابايت)</FormLabel>
                <FormControl>
                  <div className="flex min-w-0 flex-col gap-3">
                    {photo instanceof File && photoPreview ? (
                      <div className="flex items-center gap-3 rounded-md border border-border p-3">
                        <img
                          src={photoPreview}
                          alt=""
                          className="h-20 w-16 rounded object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                          <MiddleTruncate text={photo.name} />
                          <span className="text-muted-foreground">
                            {formatBytes(photo.size)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          onClick={() => onChange(undefined)}
                          aria-label="إزالة الصورة"
                        >
                          <X />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => onChange(e.target.files?.[0])}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certificate_file"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel>شهادة الثانوية العامة (PDF، أقل من 5 ميجابايت)</FormLabel>
                <FormControl>
                  <div className="flex min-w-0 flex-col gap-3">
                    {cert instanceof File ? (
                      <div className="flex items-center gap-3 rounded-md border border-border p-3">
                        <FileText className="size-8 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                          <MiddleTruncate text={cert.name} />
                          <span className="text-muted-foreground">
                            {formatBytes(cert.size)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          onClick={() => onChange(undefined)}
                          aria-label="إزالة الملف"
                        >
                          <X />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => onChange(e.target.files?.[0])}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FieldSet>

      <StepNav onBack={onBack} onNext={onNext} />
    </StepCard>
  )
}
