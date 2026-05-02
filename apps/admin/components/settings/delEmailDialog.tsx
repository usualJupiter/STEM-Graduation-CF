"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

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

interface DelEmailDialogProps {
  email: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function DelEmailDialog({
  email,
  onClose,
  onSuccess,
}: DelEmailDialogProps) {
  const t = useTranslations("Settings.access")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email) setError(null)
  }, [email])

  const handleOpenChange = (next: boolean) => {
    if (deleting) return
    if (!next) onClose()
  }

  const handleDelete = async () => {
    if (!email) return
    setError(null)
    setDeleting(true)
    try {
      await fetchJson(`/api/allowed-emails/${encodeURIComponent(email)}`, {
        method: "DELETE",
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteDialog.failed"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={email != null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("deleteDialog.description")}
          </DialogDescription>
        </DialogHeader>
        {email && (
          <p className="text-sm text-muted-foreground">
            {t("deleteDialog.removing", { email })}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            {t("deleteDialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? t("deleteDialog.submitting")
              : t("deleteDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
