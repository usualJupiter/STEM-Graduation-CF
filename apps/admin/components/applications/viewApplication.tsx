"use client"

import { Printer } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { API_URL, fetchJson } from "@/lib/api"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

interface ViewApplicationProps {
  applicationId: string | null
  onOpenChange: (open: boolean) => void
}

interface ApplicationDetail {
  id: string
  group_id: number
  group_name: string
  name: string
  nationality: string
  religion: string
  residence: string
  home_phone: string
  mobile: string
  birthdate: string
  birthplace: string
  age_october: string
  national_id: string
  id_issuing_authority: string
  id_issue_date: string
  guardian_name: string
  guardian_job: string
  guardian_address: string
  guardian_mobile: string
  certificate: string
  graduation_year: string
  total_grades: string
  first_language: string
  second_language: string
  school: string
  division: string
  educational_district: string
  governorate: string
  photo_size: number
  certificate_size: number
  declaration_accepted_at: string
  created_at: string
}

interface DetailResponse {
  data: ApplicationDetail
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export default function ViewApplication({
  applicationId,
  onOpenChange,
}: ViewApplicationProps) {
  const t = useTranslations("Applications.viewDialog")
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoSrc, setPhotoSrc] = useState<string | null>(null)
  const [photoDims, setPhotoDims] = useState<{
    w: number
    h: number
  } | null>(null)
  const open = applicationId != null

  useEffect(() => {
    if (!applicationId) {
      setDetail(null)
      setPhotoSrc(null)
      setPhotoDims(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJson<DetailResponse>(`/api/admin/applications/${applicationId}`)
      .then((res) => {
        if (cancelled) return
        setDetail(res.data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applicationId])

  // Load the photo as a blob (auth-gated) so we can both render it
  // and read its native dimensions.
  useEffect(() => {
    if (!applicationId) return
    let cancelled = false
    let blobUrl: string | null = null
    fetch(`${API_URL}/api/admin/applications/${applicationId}/files/photo`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return
        const blob = await res.blob()
        if (cancelled) return
        blobUrl = URL.createObjectURL(blob)
        setPhotoSrc(blobUrl)
        const img = new Image()
        img.onload = () => {
          if (cancelled) return
          setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight })
        }
        img.src = blobUrl
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [applicationId])

  const certUrl = applicationId
    ? `${API_URL}/api/admin/applications/${applicationId}/files/certificate`
    : null

  const ratio = photoDims
    ? (() => {
        const d = gcd(photoDims.w, photoDims.h)
        return `${photoDims.w / d}:${photoDims.h / d}`
      })()
    : null

  const handlePrint = () => {
    if (!detail) return
    const w = window.open("", "_blank", "width=900,height=1100")
    if (!w) {
      alert(t("popupBlocked"))
      return
    }
    const esc = escapeHtml
    const row = (label: string, value: string) =>
      `<dt>${esc(label)}</dt><dd>${esc(value || "—")}</dd>`
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${esc(detail.name)} — ${esc(detail.id.slice(0, 8))}</title>
  <style>
    @page { size: A4 portrait; margin: 0.7cm; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0; color: #000; background: #fff;
      font-family: system-ui, -apple-system, "Segoe UI", Tahoma, Arial, sans-serif;
      font-size: 9pt; line-height: 1.35;
    }
    h2 {
      font-size: 9pt; margin: 6pt 0 3pt; padding-bottom: 2pt;
      border-bottom: 1px solid #999; font-weight: 600;
      text-transform: uppercase; color: #444; letter-spacing: 0.04em;
    }
    .top { display: flex; gap: 8pt; align-items: flex-start; margin-bottom: 2pt; }
    .photo-wrap { width: 38mm; flex-shrink: 0; }
    .photo { width: 100%; height: auto; border: 1px solid #ccc; display: block; }
    .meta { flex: 1; }
    section { page-break-inside: avoid; break-inside: avoid; }
    section + section { margin-top: 2pt; }
    dl { display: grid; grid-template-columns: 38mm 1fr; column-gap: 6pt; row-gap: 2pt; margin: 0; }
    dt { color: #555; }
    dd { margin: 0; }
  </style>
</head>
<body>
  <div class="top">
    ${
      photoSrc
        ? `<div class="photo-wrap"><img class="photo" src="${esc(photoSrc)}" alt=""></div>`
        : ""
    }
    <div class="meta">
      <section>
        <h2>${esc(t("sections.group"))}</h2>
        <dl>
          ${row(t("fields.name"), detail.name)}
          ${row(t("fields.national_id"), detail.national_id)}
          ${row(t("fields.group"), detail.group_name)}
          ${row(
            t("fields.submittedAt"),
            new Date(detail.created_at).toLocaleString(),
          )}
        </dl>
      </section>
    </div>
  </div>

  <section>
    <h2>${esc(t("sections.student"))}</h2>
    <dl>
      ${row(t("fields.nationality"), detail.nationality)}
      ${row(t("fields.religion"), detail.religion)}
      ${row(t("fields.residence"), detail.residence)}
      ${row(t("fields.home_phone"), detail.home_phone)}
      ${row(t("fields.mobile"), detail.mobile)}
      ${row(t("fields.birthdate"), detail.birthdate)}
      ${row(t("fields.birthplace"), detail.birthplace)}
      ${row(t("fields.age_october"), detail.age_october)}
      ${row(t("fields.id_issuing_authority"), detail.id_issuing_authority)}
      ${row(t("fields.id_issue_date"), detail.id_issue_date)}
    </dl>
  </section>

  <section>
    <h2>${esc(t("sections.guardian"))}</h2>
    <dl>
      ${row(t("fields.guardian_name"), detail.guardian_name)}
      ${row(t("fields.guardian_job"), detail.guardian_job)}
      ${row(t("fields.guardian_address"), detail.guardian_address)}
      ${row(t("fields.guardian_mobile"), detail.guardian_mobile)}
    </dl>
  </section>

  <section>
    <h2>${esc(t("sections.certificate"))}</h2>
    <dl>
      ${row(t("fields.certificate"), detail.certificate)}
      ${row(t("fields.graduation_year"), detail.graduation_year)}
      ${row(t("fields.total_grades"), detail.total_grades)}
      ${row(t("fields.first_language"), detail.first_language)}
      ${row(t("fields.second_language"), detail.second_language)}
      ${row(t("fields.school"), detail.school)}
      ${row(t("fields.division"), detail.division)}
      ${row(t("fields.educational_district"), detail.educational_district)}
      ${row(t("fields.governorate"), detail.governorate)}
    </dl>
  </section>
</body>
</html>`

    w.document.open()
    w.document.write(html)
    w.document.close()

    const triggerPrint = () => {
      w.focus()
      w.print()
    }
    const img = w.document.querySelector("img.photo")
    if (img && !(img as HTMLImageElement).complete) {
      img.addEventListener("load", triggerPrint, { once: true })
      img.addEventListener("error", triggerPrint, { once: true })
    } else {
      triggerPrint()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {detail?.id && (
              <span className="font-mono text-xs">{detail.id}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {detail && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
            <div className="flex flex-col gap-3">
              <div className="rounded-md border border-border bg-muted/30 p-2">
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={detail.name}
                    className="h-auto w-full rounded object-contain"
                  />
                ) : (
                  <div className="flex h-60 items-center justify-center text-xs text-muted-foreground">
                    …
                  </div>
                )}
              </div>
              {photoDims && (
                <p className="text-xs text-muted-foreground">
                  {photoDims.w}×{photoDims.h}
                  {ratio ? ` · ${ratio}` : ""} ·{" "}
                  {formatBytes(detail.photo_size)}
                </p>
              )}
              {certUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={certUrl} target="_blank" rel="noopener noreferrer">
                    {t("openCertificate")} ({formatBytes(detail.certificate_size)})
                  </a>
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Section title={t("sections.group")}>
                <Row label={t("fields.group")} value={detail.group_name} />
                <Row
                  label={t("fields.submittedAt")}
                  value={new Date(detail.created_at).toLocaleString()}
                />
                <Row
                  label={t("fields.declarationAcceptedAt")}
                  value={new Date(detail.declaration_accepted_at).toLocaleString()}
                />
              </Section>

              <Section title={t("sections.student")}>
                <Row label={t("fields.name")} value={detail.name} />
                <Row label={t("fields.nationality")} value={detail.nationality} />
                <Row label={t("fields.religion")} value={detail.religion} />
                <Row label={t("fields.residence")} value={detail.residence} />
                <Row label={t("fields.home_phone")} value={detail.home_phone} />
                <Row label={t("fields.mobile")} value={detail.mobile} />
                <Row label={t("fields.birthdate")} value={detail.birthdate} />
                <Row label={t("fields.birthplace")} value={detail.birthplace} />
                <Row
                  label={t("fields.age_october")}
                  value={detail.age_october}
                />
                <Row
                  label={t("fields.national_id")}
                  value={detail.national_id}
                />
                <Row
                  label={t("fields.id_issuing_authority")}
                  value={detail.id_issuing_authority}
                />
                <Row
                  label={t("fields.id_issue_date")}
                  value={detail.id_issue_date}
                />
              </Section>

              <Section title={t("sections.guardian")}>
                <Row
                  label={t("fields.guardian_name")}
                  value={detail.guardian_name}
                />
                <Row
                  label={t("fields.guardian_job")}
                  value={detail.guardian_job}
                />
                <Row
                  label={t("fields.guardian_address")}
                  value={detail.guardian_address}
                />
                <Row
                  label={t("fields.guardian_mobile")}
                  value={detail.guardian_mobile}
                />
              </Section>

              <Section title={t("sections.certificate")}>
                <Row
                  label={t("fields.certificate")}
                  value={detail.certificate}
                />
                <Row
                  label={t("fields.graduation_year")}
                  value={detail.graduation_year}
                />
                <Row
                  label={t("fields.total_grades")}
                  value={detail.total_grades}
                />
                <Row
                  label={t("fields.first_language")}
                  value={detail.first_language}
                />
                <Row
                  label={t("fields.second_language")}
                  value={detail.second_language}
                />
                <Row label={t("fields.school")} value={detail.school} />
                <Row label={t("fields.division")} value={detail.division} />
                <Row
                  label={t("fields.educational_district")}
                  value={detail.educational_district}
                />
                <Row
                  label={t("fields.governorate")}
                  value={detail.governorate}
                />
              </Section>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
          <Button onClick={handlePrint} disabled={!detail}>
            <Printer />
            {t("print")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[180px_1fr]">
        {children}
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </>
  )
}
