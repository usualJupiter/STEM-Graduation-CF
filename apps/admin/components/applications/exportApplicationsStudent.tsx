"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@workspace/ui/components/field"

interface ExportApplicationsStudentProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  studentName?: string
  onExport?: (exportType: string) => void
  onCancel?: () => void
}

const EXPORT_TYPES = [
  { value: "zip", label: "ZIP File" },
  { value: "csv", label: "CSV File" },
  { value: "pdf", label: "PDF File" },
]

export default function ExportApplicationsStudent({
  open,
  onOpenChange,
  studentName = "احمد محمد احمد",
  onExport,
  onCancel,
}: ExportApplicationsStudentProps) {
  const [exportType, setExportType] = useState("zip")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Applications</DialogTitle>
          <DialogDescription>
            export application by group.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Field>
            <FieldLabel htmlFor="student-name">Student</FieldLabel>
            <Input
              id="student-name"
              defaultValue={studentName}
              readOnly
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="export-type">Export Type</FieldLabel>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger id="export-type">
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Any type different to ZIP will not include application files.
            </FieldDescription>
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange?.(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onExport?.(exportType)}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
