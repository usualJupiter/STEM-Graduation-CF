"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"

import CerInfo from "@/components/apply/cerInfo"
import ConfirmForm from "@/components/apply/confirmForm"
import FilesUpload from "@/components/apply/filesUpload"
import Progress from "@/components/apply/progress"
import StudentInfo from "@/components/apply/studentInfo"
import SubmitFail from "@/components/apply/submitFail"
import SubmitSuccess from "@/components/apply/submitSuccess"
import {
  APPLY_DRAFT_KEY,
  type ApplicationStatus,
  type ApplyValues,
  applyErrorMessage,
  certSchema,
  fullSchema,
  getApplicationStatus,
  studentSchema,
  submitApplication,
} from "@/lib/applications"
import { env } from "@/lib/env"

type FormStep = "student" | "cert" | "files" | "confirm"
type Step = FormStep | "success" | "fail"

const STEP_NUMBER: Record<FormStep, 1 | 2 | 3 | 4> = {
  student: 1,
  cert: 2,
  files: 3,
  confirm: 4,
}

const STUDENT_FIELDS = Object.keys(studentSchema.shape) as Array<
  keyof typeof studentSchema.shape
>
const CERT_FIELDS = Object.keys(certSchema.shape) as Array<
  keyof typeof certSchema.shape
>

const TURNSTILE_SITE_KEY = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const TEXT_DEFAULTS: Omit<ApplyValues, "photo" | "certificate_file"> = {
  name: "",
  nationality: "",
  religion: "",
  residence: "",
  home_phone: "",
  mobile: "",
  birthdate: "",
  birthplace: "",
  national_id: "",
  id_issuing_authority: "",
  id_issue_date: "",
  guardian_name: "",
  guardian_job: "",
  guardian_address: "",
  guardian_mobile: "",
  certificate: "",
  graduation_year: "",
  total_grades: "",
  first_language: "",
  second_language: "",
  school: "",
  division: "",
  educational_district: "",
  governorate: "",
}

export default function Application() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [step, setStep] = useState<Step>("student")
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined)

  const form = useForm<ApplyValues>({
    // @ts-expect-error version skew between zod@4.3 (_zod.version.minor=3) and
    // @hookform/resolvers@5.2.2 (expects _zod.version.minor=0). Runtime is fine.
    // Remove once @hookform/resolvers ships a release that tracks zod >=4.1.
    resolver: zodResolver(fullSchema),
    defaultValues: TEXT_DEFAULTS as Partial<ApplyValues>,
    mode: "onTouched",
  })

  useEffect(() => {
    let cancelled = false
    getApplicationStatus()
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch(() => {
        if (!cancelled) setStatus(null)
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Hydrate draft for the active group from localStorage.
  const draftLoadedRef = useRef(false)
  useEffect(() => {
    if (draftLoadedRef.current) return
    if (!status?.group) return
    draftLoadedRef.current = true
    try {
      const raw = localStorage.getItem(APPLY_DRAFT_KEY(status.group.id))
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<typeof TEXT_DEFAULTS>
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string") {
          form.setValue(k as keyof ApplyValues, v as never, {
            shouldDirty: false,
          })
        }
      }
    } catch {}
  }, [status, form])

  // Persist draft on field change (text fields only).
  useEffect(() => {
    if (!status?.group) return
    const sub = form.watch((values) => {
      const draft: Record<string, string> = {}
      for (const [k, v] of Object.entries(values)) {
        if (typeof v === "string") draft[k] = v
      }
      try {
        localStorage.setItem(
          APPLY_DRAFT_KEY(status.group!.id),
          JSON.stringify(draft),
        )
      } catch {}
    })
    return () => sub.unsubscribe()
  }, [status, form])

  const onNextStudent = async () => {
    const ok = await form.trigger(STUDENT_FIELDS as never)
    if (ok) setStep("cert")
  }
  const onNextCert = async () => {
    const ok = await form.trigger(CERT_FIELDS as never)
    if (ok) setStep("files")
  }
  const onNextFiles = async () => {
    const ok = await form.trigger(["photo", "certificate_file"] as never)
    if (ok) setStep("confirm")
  }

  const onSubmit = async (turnstileToken: string) => {
    const ok = await form.trigger()
    if (!ok) return
    const values = form.getValues()
    const result = await submitApplication(values, turnstileToken)
    if (result.ok) {
      if (status?.group) {
        try {
          localStorage.removeItem(APPLY_DRAFT_KEY(status.group.id))
        } catch {}
      }
      setStep("success")
    } else {
      setErrorCode(result.errorCode)
      setStep("fail")
    }
  }

  if (statusLoading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-muted px-4 py-12 text-muted-foreground">
        جاري التحميل…
      </div>
    )
  }
  if (!status?.accepting) {
    return (
      <section
        dir="rtl"
        className="flex w-full flex-1 items-center justify-center bg-muted px-4 py-16"
      >
        <div className="flex max-w-xl flex-col items-center gap-5">
          <span className="text-sm font-medium text-muted-foreground">
            التقديم للبرنامج
          </span>
          <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl md:leading-10">
            التقديم للبرنامج لم يبدأ بعد
          </h1>
          <p className="text-center text-base text-muted-foreground md:text-lg md:leading-8">
            قم بزيارة هذه الصفحة لاحقًا
          </p>
        </div>
      </section>
    )
  }
  if (status.alreadySubmitted) {
    return <SubmitSuccess title="تم تقديم طلبك بالفعل" />
  }
  if (step === "success") return <SubmitSuccess />
  if (step === "fail") {
    return (
      <SubmitFail
        title={applyErrorMessage(errorCode)}
        linkText="العودة وإعادة المحاولة"
        onRetry={() => {
          setErrorCode(undefined)
          setStep("confirm")
        }}
      />
    )
  }

  return (
    <div
      dir="rtl"
      className="flex w-full flex-1 flex-col items-center gap-8 bg-muted px-4 py-12 text-foreground"
    >
      <div className="flex w-full max-w-[576px] flex-col items-center gap-5">
        <span className="text-sm font-medium leading-5 text-muted-foreground">
          التقديم للبرنامج
        </span>
        <h1 className="text-center text-4xl font-semibold leading-10 tracking-tight text-foreground">
          طلب التحاق
        </h1>
        {status.group?.academic_year_label && (
          <p className="text-center text-lg leading-8 text-muted-foreground">
            العام الجامعي {status.group.academic_year_label}
          </p>
        )}
      </div>
      <Progress step={STEP_NUMBER[step]} />
      <FormProvider {...form}>
        {step === "student" && <StudentInfo onNext={onNextStudent} />}
        {step === "cert" && (
          <CerInfo onNext={onNextCert} onBack={() => setStep("student")} />
        )}
        {step === "files" && (
          <FilesUpload onNext={onNextFiles} onBack={() => setStep("cert")} />
        )}
        {step === "confirm" && (
          <ConfirmForm
            turnstileSiteKey={TURNSTILE_SITE_KEY}
            declarationText={status.group?.declaration_text ?? ""}
            onSubmit={onSubmit}
            onBack={() => setStep("files")}
          />
        )}
      </FormProvider>
    </div>
  )
}
