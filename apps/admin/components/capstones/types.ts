export type ImageSlot =
  | { kind: "existing"; key: string; url: string }
  | { kind: "new"; file: File }

export interface MaterialDraft {
  id: number
  name_en: string
  name_ar: string
  photo: ImageSlot | null
}

export interface CapstoneFormState {
  title_en: string
  title_ar: string
  full_name_en: string
  full_name_ar: string
  level: string
  semester: string
  students_en: string[]
  students_ar: string[]
  supervisors_en: string[]
  supervisors_ar: string[]

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

  producers: ImageSlot | null
  card: ImageSlot | null
  photos: ImageSlot[]
  materials: MaterialDraft[]

  poster_link: string
  portfolio_link: string
  presentation_link: string
}

export const initialCapstoneForm: CapstoneFormState = {
  title_en: "",
  title_ar: "",
  full_name_en: "",
  full_name_ar: "",
  level: "",
  semester: "",
  students_en: [],
  students_ar: [],
  supervisors_en: [],
  supervisors_ar: [],
  abstract_en: "",
  abstract_ar: "",
  introduction_en: "",
  introduction_ar: "",
  methodology_en: "",
  methodology_ar: "",
  analysis_en: "",
  analysis_ar: "",
  conclusion_en: "",
  conclusion_ar: "",
  recommendations_en: "",
  recommendations_ar: "",
  producers: null,
  card: null,
  photos: [],
  materials: [],
  poster_link: "",
  portfolio_link: "",
  presentation_link: "",
}

export function slotPreviewUrl(slot: ImageSlot): string {
  return slot.kind === "existing" ? slot.url : URL.createObjectURL(slot.file)
}

export function slotLabel(slot: ImageSlot): string {
  return slot.kind === "existing" ? "Current image" : slot.file.name
}
