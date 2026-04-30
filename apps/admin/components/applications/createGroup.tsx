"use client"

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
  Field,
  FieldLabel,
} from "@workspace/ui/components/field"

interface CreateGroupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CreateGroup({
  open,
  onOpenChange,
}: CreateGroupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            filter applications with groups.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="group-name">Group Name</FieldLabel>
          <Input id="group-name" placeholder="Placeholder" />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
