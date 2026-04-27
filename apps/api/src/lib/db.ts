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

export function createDb(d1: D1Database): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
  })
}

export type Db = Kysely<Database>
