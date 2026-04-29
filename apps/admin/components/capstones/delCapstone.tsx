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
      setError(err instanceof Error ? err.message : "Failed to delete")
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
          <DialogTitle>Delete capstone</DialogTitle>
          <DialogDescription>
            This will permanently remove the capstone, its people, materials,
            and all associated images from storage. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {capstoneName && (
          <p className="text-sm text-muted-foreground">
            Deleting: <span className="font-medium">{capstoneName}</span>
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
