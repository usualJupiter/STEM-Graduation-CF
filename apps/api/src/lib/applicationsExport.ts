import { zipSync } from "fflate"
import * as XLSX from "xlsx"

import type { Database } from "./db"
import type { Selectable } from "kysely"

type ApplicationRow = Selectable<Database["applications"]>

const COLUMNS: Array<{ key: keyof ApplicationRow; header: string }> = [
  { key: "id", header: "ID" },
  { key: "created_at", header: "Submitted at" },
  { key: "name", header: "الاسم" },
  { key: "nationality", header: "الجنسية" },
  { key: "religion", header: "الديانة" },
  { key: "residence", header: "محل الإقامة" },
  { key: "home_phone", header: "رقم هاتف المنزل" },
  { key: "mobile", header: "محمول" },
  { key: "birthdate", header: "تاريخ الميلاد" },
  { key: "birthplace", header: "جهة الميلاد" },
  { key: "age_october", header: "السن في أول أكتوبر" },
  { key: "national_id", header: "الرقم القومي" },
  { key: "id_issuing_authority", header: "جهة الإصدار" },
  { key: "id_issue_date", header: "تاريخ الإصدار" },
  { key: "guardian_name", header: "ولي الأمر" },
  { key: "guardian_job", header: "وظيفة ولي الأمر" },
  { key: "guardian_address", header: "عنوان ولي الأمر" },
  { key: "guardian_mobile", header: "محمول ولي الأمر" },
  { key: "certificate", header: "الشهادة" },
  { key: "graduation_year", header: "سنة التخرج" },
  { key: "total_grades", header: "المجموع الكلي" },
  { key: "first_language", header: "اللغة الأولى" },
  { key: "second_language", header: "اللغة الثانية" },
  { key: "school", header: "المدرسة" },
  { key: "division", header: "الشعبة" },
  { key: "educational_district", header: "المنطقة التعليمية" },
  { key: "governorate", header: "المحافظة" },
]

export function buildXlsx(rows: ApplicationRow[]): Uint8Array {
  const data = [
    COLUMNS.map((c) => c.header),
    ...rows.map((r) => COLUMNS.map((c) => r[c.key] ?? "")),
  ]
  const sheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Applications")
  const buf = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer
  return new Uint8Array(buf)
}

function safeFolderName(name: string, id: string): string {
  // Strip filesystem-unsafe chars rather than replacing with "_" so badly-formed
  // names (e.g. " / / ") don't produce ugly folders like "abcd1234___ _".
  const cleaned = name.replace(/[\\/:*?"<>|\r\n\t]+/g, "").trim()
  const short = id.slice(0, 8)
  return cleaned ? `${cleaned}-${short}` : `applicant-${short}`
}

async function fetchFileBytes(
  bucket: R2Bucket,
  key: string,
): Promise<Uint8Array | null> {
  const obj = await bucket.get(key)
  if (!obj) return null
  const buf = await obj.arrayBuffer()
  return new Uint8Array(buf)
}

export async function buildZip(opts: {
  rows: ApplicationRow[]
  bucket: R2Bucket
  manifestName?: string
}): Promise<Uint8Array> {
  const xlsx = buildXlsx(opts.rows)
  const files: Record<string, Uint8Array> = {
    [opts.manifestName ?? "applications.xlsx"]: xlsx,
  }

  // Single-applicant export: drop the per-applicant subfolder and just call it "Files".
  // Multi-applicant: each applicant gets a uniquely-named subfolder under "Files/".
  const isSingle = opts.rows.length === 1

  for (const row of opts.rows) {
    const folder = isSingle
      ? "Files"
      : `Files/${safeFolderName(row.name, row.id)}`
    const [photo, cert] = await Promise.all([
      fetchFileBytes(opts.bucket, row.photo_key),
      fetchFileBytes(opts.bucket, row.certificate_key),
    ])
    if (photo) {
      const ext = row.photo_key.split(".").pop() ?? "bin"
      files[`${folder}/photo.${ext}`] = photo
    }
    if (cert) {
      files[`${folder}/certificate.pdf`] = cert
    }
  }

  return zipSync(files, { level: 6 })
}
