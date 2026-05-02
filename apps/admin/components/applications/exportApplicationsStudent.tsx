"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { downloadAuthed } from "@/components/applications/download"

interface ExportApplicationsStudentProps {
  applicationId: string | null
  studentName?: string
  onOpenChange?: (open: boolean) => void
}

const TYPES = [
  { value: "xlsx", labelKey: "xlsx" },
  { value: "zip", labelKey: "zip" },
] as const

export default function ExportApplicationsStudent({
  applicationId,
  studentName,
  onOpenChange,
}: ExportApplicationsStudentProps) {
  const t = useTranslations("Applications.exportStudentDialog")
  const [type, setType] = useState<"xlsx" | "zip">("xlsx")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const open = applicationId != null

  useEffect(() => {
    if (!open) {
      setError(null)
      setType("xlsx")
    }
  }, [open])

  const handleExport = async () => {
    if (!applicationId) return
    setBusy(true)
    setError(null)
    try {
      const fallback = `${studentName ?? applicationId.slice(0, 8)}.${
        type === "xlsx" ? "xlsx" : "zip"
      }`
      await downloadAuthed(
        `/api/admin/applications/${applicationId}/export?type=${type}`,
        fallback,
      )
      onOpenChange?.(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="student-name">{t("student")}</FieldLabel>
            <Input id="student-name" value={studentName ?? ""} readOnly />
          </Field>
          <Field>
            <FieldLabel htmlFor="export-type">{t("type")}</FieldLabel>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "xlsx" | "zip")}
            >
              <SelectTrigger id="export-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{t("typeHint")}</FieldDescription>
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={busy}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleExport} disabled={busy}>
            {busy ? t("exporting") : t("export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
