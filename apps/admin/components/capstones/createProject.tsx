"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { fetchJson } from "@/lib/api"
import {
  uploadCapstoneImage,
  type CapstoneUploadKind,
} from "@/lib/capstones-upload"

import CreateProjectInfo from "@/components/capstones/createProjectInfo"
import CreateProjectData from "@/components/capstones/createProjectData"
import CreateProjectMedia from "@/components/capstones/createProjectMedia"
import CreateProjectResources from "@/components/capstones/createProjectResources"
import {
  type CapstoneFormState,
  type ImageSlot,
  initialCapstoneForm,
} from "@/components/capstones/types"
import {
  type FieldErrors,
  buildSchemas,
  issuesToErrors,
} from "@/components/capstones/schemas"

export const CAPSTONES_INVALIDATE_EVENT = "admin:capstones:invalidate"

interface CreateProjectProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId?: number | null
}

type Step = "info" | "data" | "media" | "resources"

interface AdminCapstoneFetchResponse {
  data: {
    id: number
    title_en: string
    title_ar: string
    full_name_en: string
    full_name_ar: string
    level: number
    semester: "first" | "second"
    abstract_en: string
    abstract_ar: string
    introduction_en: string
    introduction_ar: string
    methodology_en: string
    methodology_ar: string
    analysis_en: string
    analysis_ar: string
    conclusion_en: string
    conclusion_ar: string
    recommendations_en: string
    recommendations_ar: string
    card_photo_key: string | null
    card_photo_url: string | null
    producers_photo_key: string | null
    producers_photo_url: string | null
    poster_link: string | null
    portfolio_link: string | null
    presentation_link: string | null
    students: { id: number; name_en: string; name_ar: string; position: number }[]
    supervisors: { id: number; name_en: string; name_ar: string; position: number }[]
    materials: {
      id: number
      name_en: string
      name_ar: string
      photo_key: string | null
      photo_url: string | null
      position: number
    }[]
    photos: { id: number; photo_key: string; url: string; position: number }[]
  }
}

function emptyToNull(v: string): string | null {
  const trimmed = v.trim()
  return trimmed === "" ? null : trimmed
}

function asExisting(
  key: string | null,
  url: string | null,
): ImageSlot | null {
  if (!key || !url) return null
  return { kind: "existing", key, url }
}

function hydrate(row: AdminCapstoneFetchResponse["data"]): CapstoneFormState {
  return {
    title_en: row.title_en,
    title_ar: row.title_ar,
    full_name_en: row.full_name_en,
    full_name_ar: row.full_name_ar,
    level: String(row.level),
    semester: row.semester,
    students_en: row.students.map((s) => s.name_en),
    students_ar: row.students.map((s) => s.name_ar),
    supervisors_en: row.supervisors.map((s) => s.name_en),
    supervisors_ar: row.supervisors.map((s) => s.name_ar),
    abstract_en: row.abstract_en,
    abstract_ar: row.abstract_ar,
    introduction_en: row.introduction_en,
    introduction_ar: row.introduction_ar,
    methodology_en: row.methodology_en,
    methodology_ar: row.methodology_ar,
    analysis_en: row.analysis_en,
    analysis_ar: row.analysis_ar,
    conclusion_en: row.conclusion_en,
    conclusion_ar: row.conclusion_ar,
    recommendations_en: row.recommendations_en,
    recommendations_ar: row.recommendations_ar,
    producers: asExisting(row.producers_photo_key, row.producers_photo_url),
    card: asExisting(row.card_photo_key, row.card_photo_url),
    photos: row.photos.map((p) => ({
      kind: "existing",
      key: p.photo_key,
      url: p.url,
    })),
    materials: row.materials.map((m) => ({
      id: m.id,
      name_en: m.name_en,
      name_ar: m.name_ar,
      photo: asExisting(m.photo_key, m.photo_url),
    })),
    poster_link: row.poster_link ?? "",
    portfolio_link: row.portfolio_link ?? "",
    presentation_link: row.presentation_link ?? "",
  }
}

async function resolveSlot(
  slot: ImageSlot | null,
  kind: CapstoneUploadKind,
): Promise<string | null> {
  if (!slot) return null
  if (slot.kind === "existing") return slot.key
  return uploadCapstoneImage(slot.file, kind)
}

export default function CreateProject({
  open,
  onOpenChange,
  editingId,
}: CreateProjectProps) {
  const isEdit = editingId != null
  const t = useTranslations("Capstones")
  const schemas = useMemo(() => buildSchemas(t), [t])
  const dialogTitle = isEdit ? t("editTitle") : t("createTitle")
  const dialogDescription = t("dialogDescription")
  const [step, setStep] = useState<Step>("info")
  const [form, setForm] = useState<CapstoneFormState>(initialCapstoneForm)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) return
    setStep("info")
    setSubmitting(false)
    setError(null)
    setErrors({})

    if (editingId != null) {
      let cancelled = false
      setLoading(true)
      fetchJson<AdminCapstoneFetchResponse>(
        `/api/admin/capstones/${editingId}`,
      )
        .then((res) => {
          if (cancelled) return
          setForm(hydrate(res.data))
        })
        .catch((err: Error) => {
          if (cancelled) return
          setError(err.message)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      return () => {
        cancelled = true
      }
    }

    setForm(initialCapstoneForm)
    setLoading(false)
  }, [open, editingId])

  const onChange = (patch: Partial<CapstoneFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev
      const next = { ...prev }
      let changed = false
      for (const key of Object.keys(patch)) {
        if (key in next) {
          delete next[key]
          changed = true
        }
        // also clear any nested errors that start with the key (e.g. materials.0.name)
        for (const errKey of Object.keys(next)) {
          if (errKey.startsWith(`${key}.`)) {
            delete next[errKey]
            changed = true
          }
        }
      }
      return changed ? next : prev
    })
  }

  const validateStep = (s: Step): FieldErrors => {
    if (s === "info") {
      const r = schemas.infoSchema.safeParse({
        title_en: form.title_en,
        title_ar: form.title_ar,
        full_name_en: form.full_name_en,
        full_name_ar: form.full_name_ar,
        level: form.level,
        semester: form.semester,
        students_en: form.students_en,
        students_ar: form.students_ar,
        supervisors_en: form.supervisors_en,
        supervisors_ar: form.supervisors_ar,
      })
      return r.success ? {} : issuesToErrors(r.error.issues)
    }
    if (s === "data") {
      const r = schemas.dataSchema.safeParse(form)
      return r.success ? {} : issuesToErrors(r.error.issues)
    }
    if (s === "media") {
      const r = schemas.mediaSchema.safeParse({ materials: form.materials })
      return r.success ? {} : issuesToErrors(r.error.issues)
    }
    return {}
  }

  const goNext = (next: Step) => {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep(next)
  }

  const goBack = (prev: Step) => {
    setErrors({})
    setStep(prev)
  }

  const handleSubmit = async () => {
    // Re-validate all steps; jump back to the first one with errors.
    const checks: { step: Step; errs: FieldErrors }[] = [
      { step: "info", errs: validateStep("info") },
      { step: "data", errs: validateStep("data") },
      { step: "media", errs: validateStep("media") },
    ]
    for (const c of checks) {
      if (Object.keys(c.errs).length > 0) {
        setErrors(c.errs)
        setStep(c.step)
        return
      }
    }
    setErrors({})

    setSubmitting(true)
    setError(null)
    try {

      const [card_photo_key, producers_photo_key, photo_keys, materialKeys] =
        await Promise.all([
          resolveSlot(form.card, "card"),
          resolveSlot(form.producers, "producers"),
          Promise.all(form.photos.map((p) => resolveSlot(p, "gallery"))),
          Promise.all(form.materials.map((m) => resolveSlot(m.photo, "material"))),
        ])

      const payload = {
        title_en: form.title_en,
        title_ar: form.title_ar,
        full_name_en: form.full_name_en,
        full_name_ar: form.full_name_ar,
        level: Number(form.level),
        semester: form.semester,
        abstract_en: form.abstract_en,
        abstract_ar: form.abstract_ar,
        introduction_en: form.introduction_en,
        introduction_ar: form.introduction_ar,
        methodology_en: form.methodology_en,
        methodology_ar: form.methodology_ar,
        analysis_en: form.analysis_en,
        analysis_ar: form.analysis_ar,
        conclusion_en: form.conclusion_en,
        conclusion_ar: form.conclusion_ar,
        recommendations_en: form.recommendations_en,
        recommendations_ar: form.recommendations_ar,
        card_photo_key,
        producers_photo_key,
        poster_link: emptyToNull(form.poster_link),
        portfolio_link: emptyToNull(form.portfolio_link),
        presentation_link: emptyToNull(form.presentation_link),
        students: form.students_en.map((name_en, idx) => ({
          name_en,
          name_ar: form.students_ar[idx] ?? name_en,
        })),
        supervisors: form.supervisors_en.map((name_en, idx) => ({
          name_en,
          name_ar: form.supervisors_ar[idx] ?? name_en,
        })),
        materials: form.materials.map((m, idx) => ({
          name_en: m.name_en,
          name_ar: m.name_ar,
          photo_key: materialKeys[idx],
        })),
        photo_keys: photo_keys.filter((k): k is string => k !== null),
      }

      const path = isEdit
        ? `/api/admin/capstones/${editingId}`
        : `/api/admin/capstones`
      await fetchJson(path, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      })

      window.dispatchEvent(new Event(CAPSTONES_INVALIDATE_EVENT))
      onOpenChange(false)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : isEdit
            ? t("submitErrors.saveFailed")
            : t("submitErrors.createFailed")
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (submitting) return
        onOpenChange(o)
      }}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-[850px]">
        {loading ? (
          <>
            <DialogHeader className="p-4">
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{t("loading")}</DialogDescription>
            </DialogHeader>
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("loading")}
            </div>
          </>
        ) : (
          <>
            {step === "info" && (
              <CreateProjectInfo
                value={form}
                onChange={onChange}
                errors={errors}
                onNext={() => goNext("data")}
                title={dialogTitle}
                description={dialogDescription}
              />
            )}
            {step === "data" && (
              <CreateProjectData
                value={form}
                onChange={onChange}
                errors={errors}
                onBack={() => goBack("info")}
                onNext={() => goNext("media")}
                title={dialogTitle}
                description={dialogDescription}
              />
            )}
            {step === "media" && (
              <CreateProjectMedia
                value={form}
                onChange={onChange}
                errors={errors}
                onBack={() => goBack("data")}
                onNext={() => goNext("resources")}
                title={dialogTitle}
                description={dialogDescription}
              />
            )}
            {step === "resources" && (
              <CreateProjectResources
                value={form}
                onChange={onChange}
                onBack={() => goBack("media")}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error}
                submitLabel={isEdit ? t("submit.save") : t("submit.create")}
                submittingLabel={
                  isEdit ? t("submit.saving") : t("submit.creating")
                }
                title={dialogTitle}
                description={dialogDescription}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
