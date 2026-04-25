"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@workspace/ui/components/input-group"

const columnFields = [
  {
    id: "event-title",
    label: "Event Title",
    type: "input" as const,
    placeholder: "Placeholder",
  },
  {
    id: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Placeholder",
  },
  {
    id: "date",
    label: "Date",
    type: "input" as const,
    placeholder: "Placeholder",
  },
]

const columnFieldsAr = [
  {
    id: "event-title-ar",
    label: "Event Title AR",
    type: "input" as const,
    placeholder: "Placeholder",
  },
  {
    id: "description-ar",
    label: "Description AR",
    type: "textarea" as const,
    placeholder: "Placeholder",
  },
  {
    id: "time",
    label: "Time",
    type: "input" as const,
    placeholder: "Placeholder",
  },
]

const fileFields = [
  {
    id: "card-photo",
    label: "Upload Card Photo",
  },
  {
    id: "event-photos",
    label: "Upload Event Photos (Max 5)",
  },
]

interface CreateEventProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function FieldColumn({
  fields,
}: {
  fields: typeof columnFields
}) {
  return (
    <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
      {fields.map((field) => (
        <Field key={field.id}>
          <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
          {field.type === "textarea" ? (
            <InputGroup>
              <InputGroupTextarea
                id={field.id}
                placeholder={field.placeholder}
                className="min-h-16"
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-sm text-muted-foreground">
                  0/280 characters
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          ) : (
            <Input id={field.id} placeholder={field.placeholder} />
          )}
        </Field>
      ))}
    </div>
  )
}

export default function CreateEvent({
  open = false,
  onOpenChange,
}: CreateEventProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[850px]">
        <DialogHeader className="p-4">
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Fill all info below.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          <FieldColumn fields={columnFields} />
          <FieldColumn fields={columnFieldsAr} />
        </div>

        <div className="flex flex-col gap-2 px-4 pb-4">
          {fileFields.map((field) => (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Input id={field.id} type="file" />
            </Field>
          ))}
        </div>

        <DialogFooter className="border-t bg-muted/50 p-4">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button>Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
