"use client"

import { Printer } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

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
  declaration_accepted_at: string
  created_at: string
}

interface DetailResponse {
  data: ApplicationDetail
}

type Translator = (key: string) => string

export default function ViewApplication({
  applicationId,
  onOpenChange,
}: ViewApplicationProps) {
  const t = useTranslations("Applications.viewDialog")
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const open = applicationId != null

  useEffect(() => {
    if (!applicationId) {
      setDetail(null)
      setPhotoUrl(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJson<DetailResponse>(`/api/admin/applications/${applicationId}`)
      .then((res) => {
        if (!cancelled) setDetail(res.data)
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
        setPhotoUrl(blobUrl)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[900px]">
          <DialogHeader className="border-b border-border p-6">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {detail?.id && (
                <span className="font-mono text-xs">{detail.id}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {detail && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
                <div className="flex flex-col gap-3">
                  <div className="aspect-[2/3] w-full overflow-hidden rounded-md border border-border bg-muted/30">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={detail.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        …
                      </div>
                    )}
                  </div>
                  {certUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("viewCertificate")}
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <ApplicationSections detail={detail} t={t} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border p-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
            <Button onClick={() => window.print()} disabled={!detail}>
              <Printer />
              {t("print")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {detail &&
        typeof window !== "undefined" &&
        createPortal(
          <PrintLayout detail={detail} photoUrl={photoUrl} t={t} />,
          document.body,
        )}
    </>
  )
}

function ApplicationSections({
  detail,
  t,
}: {
  detail: ApplicationDetail
  t: Translator
}) {
  return (
    <>
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
        <Row label={t("fields.age_october")} value={detail.age_october} />
        <Row label={t("fields.national_id")} value={detail.national_id} />
        <Row
          label={t("fields.id_issuing_authority")}
          value={detail.id_issuing_authority}
        />
        <Row label={t("fields.id_issue_date")} value={detail.id_issue_date} />
      </Section>

      <Section title={t("sections.guardian")}>
        <Row label={t("fields.guardian_name")} value={detail.guardian_name} />
        <Row label={t("fields.guardian_job")} value={detail.guardian_job} />
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
        <Row label={t("fields.certificate")} value={detail.certificate} />
        <Row
          label={t("fields.graduation_year")}
          value={detail.graduation_year}
        />
        <Row label={t("fields.total_grades")} value={detail.total_grades} />
        <Row label={t("fields.first_language")} value={detail.first_language} />
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
        <Row label={t("fields.governorate")} value={detail.governorate} />
      </Section>
    </>
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
    <div className="flex flex-col gap-2 break-inside-avoid print:gap-0.5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground print:text-[9pt] print:leading-tight">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[180px_1fr] print:grid-cols-[32mm_1fr] print:gap-x-2 print:gap-y-0">
        {children}
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground print:text-[8pt] print:leading-tight">
        {label}
      </dt>
      <dd className="text-sm print:text-[8pt] print:leading-tight">
        {value || "—"}
      </dd>
    </>
  )
}

function PrintLayout({
  detail,
  photoUrl,
  t,
}: {
  detail: ApplicationDetail
  photoUrl: string | null
  t: Translator
}) {
  return (
    <div
      lang="ar"
      dir="rtl"
      className="printable hidden bg-white text-black print:block print:flex print:flex-col print:gap-1"
    >
      <div className="flex items-start gap-2">
        {photoUrl && (
          <div className="aspect-[2/3] w-[32mm] flex-shrink-0 border border-gray-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <Section title={t("sections.group")}>
            <Row label={t("fields.name")} value={detail.name} />
            <Row label={t("fields.national_id")} value={detail.national_id} />
            <Row label={t("fields.group")} value={detail.group_name} />
            <Row
              label={t("fields.submittedAt")}
              value={new Date(detail.created_at).toLocaleString()}
            />
          </Section>
        </div>
      </div>

      <Section title={t("sections.student")}>
        <Row label={t("fields.nationality")} value={detail.nationality} />
        <Row label={t("fields.religion")} value={detail.religion} />
        <Row label={t("fields.residence")} value={detail.residence} />
        <Row label={t("fields.home_phone")} value={detail.home_phone} />
        <Row label={t("fields.mobile")} value={detail.mobile} />
        <Row label={t("fields.birthdate")} value={detail.birthdate} />
        <Row label={t("fields.birthplace")} value={detail.birthplace} />
        <Row label={t("fields.age_october")} value={detail.age_october} />
        <Row
          label={t("fields.id_issuing_authority")}
          value={detail.id_issuing_authority}
        />
        <Row label={t("fields.id_issue_date")} value={detail.id_issue_date} />
      </Section>

      <Section title={t("sections.guardian")}>
        <Row label={t("fields.guardian_name")} value={detail.guardian_name} />
        <Row label={t("fields.guardian_job")} value={detail.guardian_job} />
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
        <Row label={t("fields.certificate")} value={detail.certificate} />
        <Row
          label={t("fields.graduation_year")}
          value={detail.graduation_year}
        />
        <Row label={t("fields.total_grades")} value={detail.total_grades} />
        <Row label={t("fields.first_language")} value={detail.first_language} />
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
        <Row label={t("fields.governorate")} value={detail.governorate} />
      </Section>
    </div>
  )
}
