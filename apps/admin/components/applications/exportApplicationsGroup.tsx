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

const GROUP_OPTIONS = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
]

const EXPORT_TYPE_OPTIONS = [
  { value: "zip", label: "ZIP File" },
  { value: "csv", label: "CSV File" },
  { value: "json", label: "JSON File" },
]

interface ExportApplicationsGroupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onExport?: (group: string, exportType: string) => void
  onCancel?: () => void
}

export default function ExportApplicationsGroup({
  open,
  onOpenChange,
  onExport,
  onCancel,
}: ExportApplicationsGroupProps) {
  const [group, setGroup] = useState("2025")
  const [exportType, setExportType] = useState("zip")

  const handleExport = () => {
    onExport?.(group, exportType)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

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
            <FieldLabel htmlFor="group">Group</FieldLabel>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="export-type">Export Type</FieldLabel>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger id="export-type">
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
