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

import { fetchJson } from "@/lib/api"

interface DelPhotoProps {
  photoId: number | null
  photoName?: string
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export default function DelPhoto({
  photoId,
  photoName,
  onOpenChange,
  onDeleted,
}: DelPhotoProps) {
  const t = useTranslations("Resources.gallery.deleteDialog")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = photoId != null

  const handleConfirm = async () => {
    if (photoId == null) return
    setError(null)
    setSubmitting(true)
    try {
      await fetchJson(`/api/admin/gallery/${photoId}`, { method: "DELETE" })
      onDeleted?.()
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

        {photoName && (
          <p className="text-sm text-muted-foreground">
            {t("deleting", { name: photoName })}
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
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
