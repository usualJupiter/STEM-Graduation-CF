"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

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
  APPLICATIONS_INVALIDATE_EVENT,
  APPLICATION_GROUPS_INVALIDATE_EVENT,
} from "@/components/applications/constants"
import { fetchJson } from "@/lib/api"

interface DelGroupProps {
  groupId: number | null
  groupName?: string
  applicationCount?: number
  onOpenChange: (open: boolean) => void
}

export default function DelGroup({
  groupId,
  groupName,
  applicationCount,
  onOpenChange,
}: DelGroupProps) {
  const t = useTranslations("Applications.deleteGroupDialog")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const open = groupId != null

  const handleConfirm = async () => {
    if (!groupId) return
    setError(null)
    setSubmitting(true)
    try {
      await fetchJson(`/api/admin/applications/groups/${groupId}`, {
        method: "DELETE",
      })
      window.dispatchEvent(new Event(APPLICATION_GROUPS_INVALIDATE_EVENT))
      window.dispatchEvent(new Event(APPLICATIONS_INVALIDATE_EVENT))
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failed"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (submitting) return
    if (!next) setError(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {groupName && (
          <p className="text-sm text-muted-foreground">
            {t("deleting", {
              name: groupName,
              count: applicationCount ?? 0,
            })}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? t("submitting") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
