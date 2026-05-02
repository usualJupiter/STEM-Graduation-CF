"use client"

import { useFormContext } from "react-hook-form"
import { FileText, X } from "lucide-react"

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

interface FilesUploadProps {
  onNext: () => void
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export default function FilesUpload({ onNext, onBack }: FilesUploadProps) {
  const form = useFormContext<ApplyValues>()
  const photo = form.watch("photo") as File | undefined
  const cert = form.watch("certificate_file") as File | undefined

  const photoPreview =
    photo instanceof File ? URL.createObjectURL(photo) : null

  return (
    <Form {...form}>
      <div
        dir="rtl"
        className="w-full max-w-[562px] rounded-none border bg-background"
      >
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
                    <div className="flex flex-col gap-3">
                      {photo instanceof File && photoPreview ? (
                        <div className="flex items-center gap-3 rounded-md border border-border p-3">
                          <img
                            src={photoPreview}
                            alt=""
                            className="h-20 w-16 rounded object-cover"
                          />
                          <div className="flex flex-1 flex-col gap-1 text-sm">
                            <span className="font-medium">{photo.name}</span>
                            <span className="text-muted-foreground">
                              {formatBytes(photo.size)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
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
                    <div className="flex flex-col gap-3">
                      {cert instanceof File ? (
                        <div className="flex items-center gap-3 rounded-md border border-border p-3">
                          <FileText className="size-8 text-muted-foreground" />
                          <div className="flex flex-1 flex-col gap-1 text-sm">
                            <span className="font-medium">{cert.name}</span>
                            <span className="text-muted-foreground">
                              {formatBytes(cert.size)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
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

        <div className="flex items-start gap-3 border-t p-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            السابق
          </Button>
          <Button
            type="button"
            className="flex-1 bg-defult-web text-main hover:bg-defult-web/90"
            onClick={onNext}
          >
            التالي
          </Button>
        </div>
      </div>
    </Form>
  )
}
