"use client"

import { useState } from "react"

import ApplyClosed from "@/components/apply/applyClosed"
import CerInfo from "@/components/apply/cerInfo"
import ConfirmForm from "@/components/apply/confirmForm"
import FilesUpload from "@/components/apply/filesUpload"
import Progress from "@/components/apply/progress"
import StudentInfo from "@/components/apply/studentInfo"
import SubmitFail from "@/components/apply/submitFail"
import SubmitSuccess from "@/components/apply/submitSuccess"
import Title from "@/components/apply/title"

type FormStep = "student" | "cert" | "files" | "confirm"
type Step = FormStep | "success" | "fail"

const ACCEPTING = true

const STEP_NUMBER: Record<FormStep, 1 | 2 | 3 | 4> = {
  student: 1,
  cert: 2,
  files: 3,
  confirm: 4,
}

const NUMBER_TO_STEP: Record<1 | 2 | 3 | 4, FormStep> = {
  1: "student",
  2: "cert",
  3: "files",
  4: "confirm",
}

export default function Application() {
  const [step, setStep] = useState<Step>("student")

  if (!ACCEPTING) return <ApplyClosed />
  if (step === "success") return <SubmitSuccess />
  if (step === "fail") return <SubmitFail />

  return (
    <div
      dir="rtl"
      className="flex w-full flex-1 flex-col items-center gap-8 bg-muted px-4 py-12 text-foreground"
    >
      <Title />
      <Progress
        step={STEP_NUMBER[step]}
        onStepChange={(n) => setStep(NUMBER_TO_STEP[n])}
      />
      {step === "student" && <StudentInfo onNext={() => setStep("cert")} />}
      {step === "cert" && <CerInfo onNext={() => setStep("files")} />}
      {step === "files" && <FilesUpload onSubmit={() => setStep("confirm")} />}
      {step === "confirm" && <ConfirmForm onSubmit={() => setStep("success")} />}
    </div>
  )
}
