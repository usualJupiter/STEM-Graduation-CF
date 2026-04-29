import { z } from "zod"

const MAX_SECTION = 1024

type Translator = (key: string, values?: Record<string, unknown>) => string

export function buildSchemas(t: Translator) {
  const required = (key: string) =>
    z.string().trim().min(1, t(`validation.${key}`))

  const tagsRequired = (key: string) =>
    z.array(z.string().trim().min(1)).min(1, t(`validation.${key}`))

  const sectionField = (label: string) =>
    z
      .string()
      .trim()
      .min(1, t("validation.sectionRequired", { label }))
      .max(
        MAX_SECTION,
        t("validation.sectionTooLong", { label, max: MAX_SECTION }),
      )

  const infoSchema = z
    .object({
      title_en: required("titleRequired"),
      title_ar: required("titleArRequired"),
      full_name_en: required("fullNameRequired"),
      full_name_ar: required("fullNameArRequired"),
      level: required("levelRequired"),
      semester: required("semesterRequired"),
      students_en: tagsRequired("studentsRequired"),
      students_ar: tagsRequired("studentsArRequired"),
      supervisors_en: tagsRequired("supervisorsRequired"),
      supervisors_ar: tagsRequired("supervisorsArRequired"),
    })
    .superRefine((d, ctx) => {
      if (d.students_en.length !== d.students_ar.length) {
        ctx.addIssue({
          code: "custom",
          path: ["students_ar"],
          message: t("validation.studentsMismatch"),
        })
      }
      if (d.supervisors_en.length !== d.supervisors_ar.length) {
        ctx.addIssue({
          code: "custom",
          path: ["supervisors_ar"],
          message: t("validation.supervisorsMismatch"),
        })
      }
    })

  const dataSchema = z.object({
    abstract_en: sectionField(t("data.labels.abstract")),
    abstract_ar: sectionField(t("data.labels.abstractAr")),
    introduction_en: sectionField(t("data.labels.introduction")),
    introduction_ar: sectionField(t("data.labels.introductionAr")),
    methodology_en: sectionField(t("data.labels.methodology")),
    methodology_ar: sectionField(t("data.labels.methodologyAr")),
    analysis_en: sectionField(t("data.labels.analysis")),
    analysis_ar: sectionField(t("data.labels.analysisAr")),
    conclusion_en: sectionField(t("data.labels.conclusion")),
    conclusion_ar: sectionField(t("data.labels.conclusionAr")),
    recommendations_en: sectionField(t("data.labels.recommendations")),
    recommendations_ar: sectionField(t("data.labels.recommendationsAr")),
  })

  const mediaSchema = z.object({
    materials: z.array(
      z.object({
        id: z.number(),
        name_en: required("materialNameRequired"),
        name_ar: required("materialNameArRequired"),
        photo: z.any().nullable().optional(),
      }),
    ),
  })

  return { infoSchema, dataSchema, mediaSchema }
}

export type FieldErrors = Record<string, string>

export function issuesToErrors(issues: z.ZodIssue[]): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path.map(String).join(".")
    if (!out[key]) out[key] = issue.message
  }
  return out
}
