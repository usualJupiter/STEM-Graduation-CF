import { Kysely, type Generated } from "kysely"
import { D1Dialect } from "kysely-d1"

export interface Database {
  user: UserTable
  session: SessionTable
  account: AccountTable
  verification: VerificationTable
  allowed_emails: AllowedEmailTable
  events: EventTable
  event_photos: EventPhotoTable
  gallery_photos: GalleryPhotoTable
  schedule_levels: ScheduleLevelTable
  capstones: CapstoneTable
  capstone_people: CapstonePersonTable
  capstone_materials: CapstoneMaterialTable
  capstone_photos: CapstonePhotoTable
}

interface UserTable {
  id: string
  name: string
  email: string
  emailVerified: number
  image: string | null
  createdAt: string
  updatedAt: string
}

interface SessionTable {
  id: string
  userId: string
  token: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
}

interface AccountTable {
  id: string
  userId: string
  accountId: string
  providerId: string
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  scope: string | null
  idToken: string | null
  password: string | null
  createdAt: string
  updatedAt: string
}

interface VerificationTable {
  id: string
  identifier: string
  value: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

interface AllowedEmailTable {
  email: string
  addedByUserId: string | null
  addedAt: string
  is_default: Generated<number>
}

interface EventTable {
  id: Generated<number>
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  event_date: string
  event_time: string
  card_photo_key: string | null
  author_id: string
  created_at: string
  updated_at: string
}

interface EventPhotoTable {
  id: Generated<number>
  event_id: number
  photo_key: string
  position: number
  created_at: string
}

interface GalleryPhotoTable {
  id: Generated<number>
  photo_key: string
  file_size: number
  original_name: string | null
  author_id: string
  created_at: string
}

interface ScheduleLevelTable {
  level: number
  drive_url: string
  updated_at: string
  updated_by: string | null
}

interface CapstoneTable {
  id: Generated<number>
  slug: string
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
  producers_photo_key: string | null
  poster_link: string | null
  portfolio_link: string | null
  presentation_link: string | null
  author_id: string
  created_at: string
  updated_at: string
}

interface CapstonePersonTable {
  id: Generated<number>
  capstone_id: number
  role: "student" | "supervisor"
  name_en: string
  name_ar: string
  position: number
  created_at: string
}

interface CapstoneMaterialTable {
  id: Generated<number>
  capstone_id: number
  name_en: string
  name_ar: string
  photo_key: string | null
  position: number
  created_at: string
}

interface CapstonePhotoTable {
  id: Generated<number>
  capstone_id: number
  photo_key: string
  position: number
  created_at: string
}

export function createDb(d1: D1Database): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
  })
}

export type Db = Kysely<Database>
