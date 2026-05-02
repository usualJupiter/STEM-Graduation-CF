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
import { Input } from "@workspace/ui/components/input"

import { fetchJson } from "@/lib/api"

interface AddEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AddEmailDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEmailDialogProps) {
  const t = useTranslations("Settings.access")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (submitting) return
    if (!next) {
      setError(null)
      setEmail("")
    }
    onOpenChange(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await fetchJson("/api/allowed-emails", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      })
      setEmail("")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("addEmailDialog.failed"),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("addEmailDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("addEmailDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            dir="ltr"
            placeholder={t("addEmailDialog.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              {t("addEmailDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !email.trim()}
              className="bg-secondry-web text-white hover:bg-secondry-web/90"
            >
              {submitting
                ? t("addEmailDialog.submitting")
                : t("addEmailDialog.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
