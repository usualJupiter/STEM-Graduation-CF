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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { downloadAuthed } from "@/components/applications/download"
import { fetchJson } from "@/lib/api"

interface ExportApplicationsGroupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface GroupRow {
  id: number
  name: string
  application_count: number
}

interface GroupsResponse {
  data: GroupRow[]
}

const TYPES = [
  { value: "xlsx", labelKey: "xlsx" },
  { value: "zip", labelKey: "zip" },
] as const

export default function ExportApplicationsGroup({
  open,
  onOpenChange,
}: ExportApplicationsGroupProps) {
  const t = useTranslations("Applications.exportGroupDialog")
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [groupId, setGroupId] = useState<string>("")
  const [type, setType] = useState<"xlsx" | "zip">("xlsx")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setError(null)
      return
    }
    let cancelled = false
    fetchJson<GroupsResponse>("/api/admin/applications/groups")
      .then((res) => {
        if (cancelled) return
        setGroups(res.data)
        if (res.data.length > 0 && !groupId) {
          setGroupId(String(res.data[0]!.id))
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [open, groupId])

  const handleExport = async () => {
    if (!groupId) return
    setBusy(true)
    setError(null)
    try {
      const group = groups.find((g) => String(g.id) === groupId)
      const fallback = `${group?.name ?? "group"}.${type === "xlsx" ? "xlsx" : "zip"}`
      await downloadAuthed(
        `/api/admin/applications/groups/${groupId}/export?type=${type}`,
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
            <FieldLabel htmlFor="group">{t("group")}</FieldLabel>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder={t("groupPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name} ({g.application_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="type">{t("type")}</FieldLabel>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "xlsx" | "zip")}
            >
              <SelectTrigger id="type">
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
          <Button onClick={handleExport} disabled={!groupId || busy}>
            {busy ? t("exporting") : t("export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
