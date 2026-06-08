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
import {
  ACCEPT_ATTR,
  isAcceptedFile,
  uploadImage,
  uploadImages,
} from "@/lib/upload"

const MAX_GALLERY = 5

export const EVENTS_INVALIDATE_EVENT = "admin:events:invalidate"

type Translator = (key: string, values?: Record<string, unknown>) => string

function buildSchema(t: Translator) {
  const fileSchema = z
    .instanceof(File, { message: t("validation.required") })
    .refine(isAcceptedFile, {
      message: t("validation.fileType"),
    })

  return z.object({
    title_en: z.string().trim().min(1, t("validation.required")),
    title_ar: z.string().trim().min(1, t("validation.required")),
    description_en: z.string().trim().min(1, t("validation.required")),
    description_ar: z.string().trim().min(1, t("validation.required")),
    event_date: z.string().trim().min(1, t("validation.required")),
    event_time: z.string().trim().min(1, t("validation.required")),
    card_photo: fileSchema,
    event_photos: z
      .array(fileSchema)
      .max(MAX_GALLERY, t("validation.tooManyFiles", { max: MAX_GALLERY }))
      .default([]),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface CreateEventProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CreateEvent({
  open = false,
  onOpenChange,
}: CreateEventProps) {
  const t = useTranslations("Events.createEventDialog")
  const schema = useMemo(() => buildSchema(t), [t])
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    if (!open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      const card = await uploadImage(values.card_photo, "events")
      const gallery = await uploadImages(values.event_photos, "events")
      const galleryKeys = gallery.map((g) => g.key)
      await fetchJson("/api/admin/events", {
        method: "POST",
        body: JSON.stringify({
          title_en: values.title_en,
          title_ar: values.title_ar,
          description_en: values.description_en,
          description_ar: values.description_ar,
          event_date: values.event_date,
          event_time: values.event_time,
          card_photo_key: card.key,
          photo_keys: galleryKeys,
        }),
      })
      window.dispatchEvent(new Event(EVENTS_INVALIDATE_EVENT))
      onOpenChange?.(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("createFailed")
      if (msg === "MAX_EVENTS_REACHED") {
        setSubmitError(t("limitReached", { limit: 30 }))
      } else {
        setSubmitError(msg)
      }
    }
  }

  const isSubmitting = form.formState.isSubmitting

  const validateFile = (file: File): string | null => {
    if (!isAcceptedFile(file)) return t("validation.fileType")
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[850px]">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto pt-4">
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
                        value={field.value as File | undefined}
                        onChange={field.onChange}
                        accept={ACCEPT_ATTR}
                        chooseLabel={t("chooseFile")}
                        replaceLabel={t("replaceFile")}
                        removeLabel={t("removeFile")}
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
                        value={field.value ?? []}
                        onChange={field.onChange}
                        accept={ACCEPT_ATTR}
                        max={MAX_GALLERY}
                        addLabel={t("addFiles")}
                        removeLabel={t("removeFile")}
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
            </div>

            <DialogFooter className="border-t bg-muted/50 p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondry-web text-white hover:bg-secondry-web/90"
              >
                {isSubmitting ? t("submitting") : t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function FileRow({
  name,
  size,
  onRemove,
  removeLabel,
}: {
  name: string
  size: number
  onRemove: () => void
  removeLabel: string
}) {
  return (
    <li className="flex items-center justify-between gap-2 border border-border bg-background px-3 py-2 text-xs">
      <span className="min-w-0 flex-1 truncate" title={name}>
        {name}{" "}
        <span className="text-muted-foreground">
          ({Math.round(size / 1024)} KB)
        </span>
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
  replaceLabel,
  removeLabel,
  validate,
}: {
  value: File | undefined
  onChange: (file: File | undefined) => void
  accept: string
  chooseLabel: string
  replaceLabel: string
  removeLabel: string
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
          onChange(file)
        }}
      />
      {value && (
        <ul className="flex flex-col gap-1">
          <FileRow
            name={value.name}
            size={value.size}
            onRemove={() => {
              setPickError(null)
              onChange(undefined)
            }}
            removeLabel={removeLabel}
          />
        </ul>
      )}
      {/* Always shown: picking a file sets a defined value (reliable re-render),
          so this doubles as "replace" when a photo already exists. */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setPickError(null)
          inputRef.current?.click()
        }}
      >
        {value ? replaceLabel : chooseLabel}
      </Button>
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
  validate,
}: {
  value: File[]
  onChange: (files: File[]) => void
  accept: string
  max: number
  addLabel: string
  removeLabel: string
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
          const accepted: File[] = []
          for (const file of picked) {
            const err = validate?.(file) ?? null
            if (err) errors.push(`${file.name}: ${err}`)
            else accepted.push(file)
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
          {value.map((file, idx) => (
            <FileRow
              key={`${file.name}-${idx}`}
              name={file.name}
              size={file.size}
              onRemove={() => {
                setPickErrors([])
                onChange(value.filter((_, i) => i !== idx))
              }}
              removeLabel={removeLabel}
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

