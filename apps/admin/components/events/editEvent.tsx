"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import { fetchJson } from "@/lib/api"
import { EVENTS_INVALIDATE_EVENT } from "@/components/events/createEvent"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
const MAX_BYTES = 1024 * 1024 // 1 MB
const MAX_GALLERY = 5

type Translator = (key: string, values?: Record<string, unknown>) => string

function buildSchema(t: Translator) {
  const newPhotoSchema = z.object({
    kind: z.literal("new"),
    file: z
      .instanceof(File, { message: t("validation.required") })
      .refine((f) => (ALLOWED_TYPES as readonly string[]).includes(f.type), {
        message: t("validation.fileType"),
      })
      .refine((f) => f.size <= MAX_BYTES, {
        message: t("validation.fileTooLarge", { maxKb: MAX_BYTES / 1024 }),
      }),
  })

  const existingPhotoSchema = z.object({
    kind: z.literal("existing"),
    key: z.string().min(1),
  })

  const photoSchema = z.discriminatedUnion("kind", [
    existingPhotoSchema,
    newPhotoSchema,
  ])

  return z.object({
    title_en: z.string().trim().min(1, t("validation.required")),
    title_ar: z.string().trim().min(1, t("validation.required")),
    description_en: z.string().trim().min(1, t("validation.required")),
    description_ar: z.string().trim().min(1, t("validation.required")),
    event_date: z.string().trim().min(1, t("validation.required")),
    event_time: z.string().trim().min(1, t("validation.required")),
    card_photo: photoSchema,
    event_photos: z
      .array(photoSchema)
      .max(MAX_GALLERY, t("validation.tooManyFiles", { max: MAX_GALLERY }))
      .default([]),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>
type PhotoValue = FormValues["card_photo"]

interface EventDetailResponse {
  data: {
    id: number
    title_en: string
    title_ar: string
    description_en: string
    description_ar: string
    event_date: string
    event_time: string
    card_photo_key: string | null
    photos: Array<{ id: number; photo_key: string; position: number }>
  }
}

interface SignResponse {
  data: { uploadUrl: string; key: string }
}

interface EditEventProps {
  eventId: number | null
  onOpenChange: (open: boolean) => void
}

async function uploadFile(
  file: File,
  kind: "card" | "gallery",
): Promise<string> {
  const sign = await fetchJson<SignResponse>(
    "/api/admin/uploads/event-photos/sign",
    {
      method: "POST",
      body: JSON.stringify({ contentType: file.type, kind }),
    },
  )
  const res = await fetch(sign.data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  })
  if (!res.ok) throw new Error(`R2 upload failed (${res.status})`)
  return sign.data.key
}

function keyFilename(key: string): string {
  const idx = key.lastIndexOf("/")
  return idx === -1 ? key : key.slice(idx + 1)
}

export default function EditEvent({ eventId, onOpenChange }: EditEventProps) {
  const t = useTranslations("Events.editEventDialog")
  const schema = useMemo(() => buildSchema(t), [t])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title_en: "",
      title_ar: "",
      description_en: "",
      description_ar: "",
      event_date: "",
      event_time: "",
      event_photos: [],
    },
  })

  useEffect(() => {
    if (eventId == null) {
      form.reset()
      setSubmitError(null)
      setLoadError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    fetchJson<EventDetailResponse>(`/api/admin/events/${eventId}`)
      .then(({ data }) => {
        if (cancelled) return
        form.reset({
          title_en: data.title_en,
          title_ar: data.title_ar,
          description_en: data.description_en,
          description_ar: data.description_ar,
          event_date: data.event_date,
          event_time: data.event_time,
          card_photo: data.card_photo_key
            ? { kind: "existing", key: data.card_photo_key }
            : undefined,
          event_photos: data.photos.map((p) => ({
            kind: "existing" as const,
            key: p.photo_key,
          })),
        })
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message || t("loadFailed"))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eventId, form, t])

  const onSubmit = async (values: FormValues) => {
    if (eventId == null) return
    setSubmitError(null)
    try {
      const cardKey =
        values.card_photo.kind === "new"
          ? await uploadFile(values.card_photo.file, "card")
          : values.card_photo.key

      const galleryKeys = await Promise.all(
        values.event_photos.map((item) =>
          item.kind === "new"
            ? uploadFile(item.file, "gallery")
            : Promise.resolve(item.key),
        ),
      )

      await fetchJson(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title_en: values.title_en,
          title_ar: values.title_ar,
          description_en: values.description_en,
          description_ar: values.description_ar,
          event_date: values.event_date,
          event_time: values.event_time,
          card_photo_key: cardKey,
          photo_keys: galleryKeys,
        }),
      })
      window.dispatchEvent(new Event(EVENTS_INVALIDATE_EVENT))
      onOpenChange(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("saveFailed"))
    }
  }

  const isSubmitting = form.formState.isSubmitting
  const open = eventId != null

  const validateFile = (file: File): string | null => {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return t("validation.fileType")
    }
    if (file.size > MAX_BYTES) {
      return t("validation.fileTooLarge", { maxKb: MAX_BYTES / 1024 })
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[850px]">
        <DialogHeader className="p-4">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {loading && (
          <p className="px-4 pb-4 text-sm text-muted-foreground">
            {t("loading")}
          </p>
        )}

        {loadError && !loading && (
          <p className="px-4 pb-4 text-sm text-destructive">{loadError}</p>
        )}

        {!loading && !loadError && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4 px-4 pb-4 md:flex-row">
                <div className="flex flex-1 flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="title_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("titleEn")}</FormLabel>
                        <FormControl>
                          <Input dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("descriptionEn")}</FormLabel>
                        <FormControl>
                          <Textarea dir="ltr" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="event_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("date")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="title_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("titleAr")}</FormLabel>
                        <FormControl>
                          <Input dir="rtl" className="text-right" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("descriptionAr")}</FormLabel>
                        <FormControl>
                          <Textarea
                            dir="rtl"
                            rows={4}
                            className="text-right"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="event_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("time")}</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 px-4 pb-4">
                <FormField
                  control={form.control}
                  name="card_photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("cardPhoto")}</FormLabel>
                      <FormControl>
                        <SingleFilePicker
                          value={field.value as PhotoValue | undefined}
                          onChange={field.onChange}
                          accept={ALLOWED_TYPES.join(",")}
                          chooseLabel={t("chooseFile")}
                          removeLabel={t("removeFile")}
                          savedBadge={t("savedBadge")}
                          validate={validateFile}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_photos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("eventPhotos", { max: MAX_GALLERY })}
                      </FormLabel>
                      <FormControl>
                        <MultiFilePicker
                          value={(field.value as PhotoValue[] | undefined) ?? []}
                          onChange={field.onChange}
                          accept={ALLOWED_TYPES.join(",")}
                          max={MAX_GALLERY}
                          addLabel={t("addFiles")}
                          removeLabel={t("removeFile")}
                          savedBadge={t("savedBadge")}
                          validate={validateFile}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {submitError && (
                <p className="px-4 pb-2 text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <DialogFooter className="border-t bg-muted/50 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PhotoRow({
  value,
  onRemove,
  removeLabel,
  savedBadge,
}: {
  value: PhotoValue
  onRemove: () => void
  removeLabel: string
  savedBadge: string
}) {
  const isExisting = value.kind === "existing"
  const name = isExisting ? keyFilename(value.key) : value.file.name
  const sizeText = isExisting ? null : `${Math.round(value.file.size / 1024)} KB`

  return (
    <li className="flex items-center justify-between gap-2 border border-border bg-background px-3 py-2 text-xs">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="min-w-0 truncate" title={name}>
          {name}
        </span>
        {sizeText && <span className="text-muted-foreground">({sizeText})</span>}
        {isExisting && (
          <span className="rounded-none border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
            {savedBadge}
          </span>
        )}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <X />
      </Button>
    </li>
  )
}

function SingleFilePicker({
  value,
  onChange,
  accept,
  chooseLabel,
  removeLabel,
  savedBadge,
  validate,
}: {
  value: PhotoValue | undefined
  onChange: (v: PhotoValue | undefined) => void
  accept: string
  chooseLabel: string
  removeLabel: string
  savedBadge: string
  validate?: (file: File) => string | null
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [pickError, setPickError] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (!file) return
          const err = validate?.(file) ?? null
          if (err) {
            setPickError(`${file.name}: ${err}`)
            return
          }
          setPickError(null)
          onChange({ kind: "new", file })
        }}
      />
      {!value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPickError(null)
            inputRef.current?.click()
          }}
        >
          {chooseLabel}
        </Button>
      )}
      {value && (
        <ul className="flex flex-col gap-1">
          <PhotoRow
            value={value}
            onRemove={() => {
              setPickError(null)
              onChange(undefined)
            }}
            removeLabel={removeLabel}
            savedBadge={savedBadge}
          />
        </ul>
      )}
      {pickError && (
        <p className="text-xs text-destructive">{pickError}</p>
      )}
    </div>
  )
}

function MultiFilePicker({
  value,
  onChange,
  accept,
  max,
  addLabel,
  removeLabel,
  savedBadge,
  validate,
}: {
  value: PhotoValue[]
  onChange: (v: PhotoValue[]) => void
  accept: string
  max: number
  addLabel: string
  removeLabel: string
  savedBadge: string
  validate?: (file: File) => string | null
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [pickErrors, setPickErrors] = useState<string[]>([])
  const remaining = Math.max(0, max - value.length)

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files ? Array.from(e.target.files) : []
          e.target.value = ""
          if (picked.length === 0) return

          const errors: string[] = []
          const accepted: PhotoValue[] = []
          for (const file of picked) {
            const err = validate?.(file) ?? null
            if (err) errors.push(`${file.name}: ${err}`)
            else accepted.push({ kind: "new", file })
          }
          setPickErrors(errors)
          if (accepted.length > 0) {
            const next = [...value, ...accepted].slice(0, max)
            onChange(next)
          }
        }}
      />
      {remaining > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPickErrors([])
            inputRef.current?.click()
          }}
        >
          {addLabel}
        </Button>
      )}
      {value.length > 0 && (
        <ul className="flex flex-col gap-1">
          {value.map((item, idx) => (
            <PhotoRow
              key={item.kind === "existing" ? item.key : `${item.file.name}-${idx}`}
              value={item}
              onRemove={() => {
                setPickErrors([])
                onChange(value.filter((_, i) => i !== idx))
              }}
              removeLabel={removeLabel}
              savedBadge={savedBadge}
            />
          ))}
        </ul>
      )}
      {pickErrors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {pickErrors.map((msg, idx) => (
            <li key={idx} className="text-xs text-destructive">
              {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
