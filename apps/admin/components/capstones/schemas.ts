import { z } from "zod"

const MAX_SECTION = 1024

const required = (msg = "Required") => z.string().trim().min(1, msg)
const tagsRequired = (msg: string) =>
  z.array(z.string().trim().min(1)).min(1, msg)
const sectionField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(MAX_SECTION, `${label} must be ${MAX_SECTION} characters or fewer`)

export const infoSchema = z
  .object({
    title_en: required("Project title is required"),
    title_ar: required("Project title (AR) is required"),
    full_name_en: required("Project full name is required"),
    full_name_ar: required("Project full name (AR) is required"),
    level: required("Select a level"),
    semester: required("Select a semester"),
    students_en: tagsRequired("Add at least one student"),
    students_ar: tagsRequired("Add at least one student (AR)"),
    supervisors_en: tagsRequired("Add at least one supervisor"),
    supervisors_ar: tagsRequired("Add at least one supervisor (AR)"),
  })
  .superRefine((d, ctx) => {
    if (d.students_en.length !== d.students_ar.length) {
      ctx.addIssue({
        code: "custom",
        path: ["students_ar"],
        message: "Must match Students count",
      })
    }
    if (d.supervisors_en.length !== d.supervisors_ar.length) {
      ctx.addIssue({
        code: "custom",
        path: ["supervisors_ar"],
        message: "Must match Supervisors count",
      })
    }
  })

export const dataSchema = z.object({
  abstract_en: sectionField("Abstract"),
  abstract_ar: sectionField("Abstract (AR)"),
  introduction_en: sectionField("Introduction"),
  introduction_ar: sectionField("Introduction (AR)"),
  methodology_en: sectionField("Methodology"),
  methodology_ar: sectionField("Methodology (AR)"),
  analysis_en: sectionField("Analysis"),
  analysis_ar: sectionField("Analysis (AR)"),
  conclusion_en: sectionField("Conclusion"),
  conclusion_ar: sectionField("Conclusion (AR)"),
  recommendations_en: sectionField("Recommendations"),
  recommendations_ar: sectionField("Recommendations (AR)"),
})

export const mediaSchema = z.object({
  materials: z.array(
    z.object({
      id: z.number(),
      name_en: required("Material name is required"),
      name_ar: required("Material name (AR) is required"),
      photo: z.any().nullable().optional(),
    }),
  ),
})

export type FieldErrors = Record<string, string>

export function issuesToErrors(issues: z.ZodIssue[]): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path.map(String).join(".")
    if (!out[key]) out[key] = issue.message
  }
  return out
}
