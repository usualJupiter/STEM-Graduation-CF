"use client"

import { useEffect, useMemo, useRef } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel } from "@workspace/ui/components/field"

import {
  type CapstoneFormState,
  type ImageSlot,
  type MaterialDraft,
} from "@/components/capstones/types"
import type { FieldErrors } from "@/components/capstones/schemas"

const MAX_PHOTOS = 6

interface CreateProjectMediaProps {
  value: CapstoneFormState
  onChange: (patch: Partial<CapstoneFormState>) => void
  errors?: FieldErrors
  onBack?: () => void
  onNext?: () => void
  title: string
  description: string
}

export default function CreateProjectMedia({
  value,
  onChange,
  errors = {},
  onBack,
  onNext,
  title,
  description,
}: CreateProjectMediaProps) {
  const tMedia = useTranslations("Capstones.media")
  const tSubmit = useTranslations("Capstones.submit")

  const addMaterial = () => {
    onChange({
      materials: [
        ...value.materials,
        { id: Date.now(), name_en: "", name_ar: "", photo: null },
      ],
    })
  }

  const updateMaterial = (id: number, patch: Partial<MaterialDraft>) => {
    onChange({
      materials: value.materials.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    })
  }

  const removeMaterial = (id: number) => {
    onChange({ materials: value.materials.filter((m) => m.id !== id) })
  }

  const handlePhotosPick = (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_PHOTOS - value.photos.length
    if (remaining <= 0) return
    const incoming: ImageSlot[] = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({ kind: "new", file }))
    onChange({ photos: [...value.photos, ...incoming] })
  }

  const removePhotoAt = (idx: number) => {
    onChange({ photos: value.photos.filter((_, i) => i !== idx) })
  }

  return (
    <>
      <DialogHeader className="p-4">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-4 pb-4">
        <SingleImageField
          id="producers"
          label={tMedia("producers")}
          slot={value.producers}
          onPick={(file) => onChange({ producers: { kind: "new", file } })}
          onClear={() => onChange({ producers: null })}
          removeAria={tMedia("removeAria")}
        />
        <SingleImageField
          id="project-card"
          label={tMedia("card")}
          slot={value.card}
          onPick={(file) => onChange({ card: { kind: "new", file } })}
          onClear={() => onChange({ card: null })}
          removeAria={tMedia("removeAria")}
        />

        <Field>
          <FieldLabel htmlFor="project-photos">
            {tMedia("photos", { max: MAX_PHOTOS })}
          </FieldLabel>
          <Input
            id="project-photos"
            type="file"
            accept="image/*"
            multiple
            className="rounded-none"
            onChange={(e) => {
              handlePhotosPick(e.target.files)
              e.target.value = ""
            }}
          />
          {value.photos.length > 0 && (
            <ul className="flex flex-col gap-1">
              {value.photos.map((slot, idx) => (
                <FilePreviewRow
                  key={slot.kind === "existing" ? slot.key : `new-${idx}`}
                  slot={slot}
                  onRemove={() => removePhotoAt(idx)}
                  removeAria={tMedia("removePhotoAria")}
                />
              ))}
            </ul>
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {tMedia("materials")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMaterial}
            >
              <Plus />
              {tMedia("addNew")}
            </Button>
          </div>
          {value.materials.length > 0 && (
            <div className="flex flex-col gap-4">
              {value.materials.map((material, idx) => (
                <MaterialRow
                  key={material.id}
                  material={material}
                  nameEnError={errors[`materials.${idx}.name_en`]}
                  nameArError={errors[`materials.${idx}.name_ar`]}
                  uploadHint={tMedia("uploadHint")}
                  uploadAria={tMedia("uploadMaterialAria")}
                  removeAria={tMedia("removeMaterialAria")}
                  onChange={(patch) => updateMaterial(material.id, patch)}
                  onRemove={() => removeMaterial(material.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="border-t border-border bg-muted p-4">
        <Button variant="outline" onClick={onBack}>
          {tSubmit("back")}
        </Button>
        <Button
          onClick={onNext}
          className="min-w-32 bg-secondry-web text-white hover:bg-secondry-web/90"
        >
          {tSubmit("next")}
        </Button>
      </DialogFooter>
    </>
  )
}

function SingleImageField({
  id,
  label,
  slot,
  onPick,
  onClear,
  removeAria,
}: {
  id: string
  label: string
  slot: ImageSlot | null
  onPick: (file: File) => void
  onClear: () => void
  removeAria: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="file"
        accept="image/*"
        className="rounded-none"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) onPick(file)
        }}
      />
      {slot && (
        <FilePreviewRow slot={slot} onRemove={onClear} removeAria={removeAria} />
      )}
    </Field>
  )
}

function FilePreviewRow({
  slot,
  onRemove,
  removeAria,
}: {
  slot: ImageSlot
  onRemove: () => void
  removeAria: string
}) {
  const url = useMemo(() => {
    if (slot.kind === "existing") return slot.url
    return URL.createObjectURL(slot.file)
  }, [slot])

  useEffect(() => {
    if (slot.kind === "new") {
      return () => URL.revokeObjectURL(url)
    }
  }, [slot, url])

  const label = slot.kind === "existing" ? removeAria : slot.file.name

  return (
    <li className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="size-10 rounded-sm object-cover" />
      <span className="min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={removeAria}
        onClick={onRemove}
      >
        <X />
      </Button>
    </li>
  )
}

function MaterialRow({
  material,
  nameEnError,
  nameArError,
  uploadHint,
  uploadAria,
  removeAria,
  onChange,
  onRemove,
}: {
  material: MaterialDraft
  nameEnError?: string
  nameArError?: string
  uploadHint: string
  uploadAria: string
  removeAria: string
  onChange: (patch: Partial<MaterialDraft>) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const photoUrl = useMemo(() => {
    if (!material.photo) return null
    if (material.photo.kind === "existing") return material.photo.url
    return URL.createObjectURL(material.photo.file)
  }, [material.photo])

  useEffect(() => {
    if (material.photo?.kind === "new" && photoUrl) {
      return () => URL.revokeObjectURL(photoUrl)
    }
  }, [material.photo, photoUrl])

  return (
    <div className="flex items-start gap-2 rounded-md border border-border p-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={uploadAria}
        className="size-10 shrink-0 overflow-hidden rounded-sm bg-muted"
      >
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="size-full object-cover" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          onChange({ photo: file ? { kind: "new", file } : null })
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
            EN
          </span>
          <Input
            value={material.name_en}
            onChange={(e) => onChange({ name_en: e.target.value })}
            className="h-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
            AR
          </span>
          <Input
            dir="rtl"
            value={material.name_ar}
            onChange={(e) => onChange({ name_ar: e.target.value })}
            className="h-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0"
          />
        </div>
        <p className="text-sm text-muted-foreground">{uploadHint}</p>
        {nameEnError && (
          <p className="text-xs text-destructive">{nameEnError}</p>
        )}
        {nameArError && (
          <p className="text-xs text-destructive">{nameArError}</p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={removeAria}
        className="shrink-0"
        onClick={onRemove}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  )
}
