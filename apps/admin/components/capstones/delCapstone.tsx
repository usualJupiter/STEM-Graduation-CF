"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"

import { fetchJson } from "@/lib/api"
import { CAPSTONES_INVALIDATE_EVENT } from "@/components/capstones/createProject"

interface DelCapstoneProps {
  capstoneId: number | null
  capstoneName?: string
  onOpenChange: (open: boolean) => void
}

export default function DelCapstone({
  capstoneId,
  capstoneName,
  onOpenChange,
}: DelCapstoneProps) {
  const t = useTranslations("Capstones.delete")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = capstoneId !== null

  const handleDelete = async () => {
    if (capstoneId === null) return
    setSubmitting(true)
    setError(null)
    try {
      await fetchJson(`/api/admin/capstones/${capstoneId}`, {
        method: "DELETE",
      })
      window.dispatchEvent(new Event(CAPSTONES_INVALIDATE_EVENT))
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (submitting) return
        if (!o) setError(null)
        onOpenChange(o)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {capstoneName && (
          <p className="text-sm text-muted-foreground">
            {t("deleting", { name: capstoneName })}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? t("deletingButton") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
