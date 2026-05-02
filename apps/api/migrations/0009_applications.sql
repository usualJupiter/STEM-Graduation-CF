CREATE TABLE IF NOT EXISTS "application_groups" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "academic_year_label" TEXT NOT NULL,
  "declaration_text" TEXT NOT NULL,
  "is_active" INTEGER NOT NULL DEFAULT 0 CHECK ("is_active" IN (0, 1)),
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_application_groups_active"
  ON "application_groups" ("is_active") WHERE "is_active" = 1;

CREATE TABLE IF NOT EXISTS "applications" (
  "id" TEXT PRIMARY KEY,
  "group_id" INTEGER NOT NULL REFERENCES "application_groups"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "nationality" TEXT NOT NULL,
  "religion" TEXT NOT NULL,
  "residence" TEXT NOT NULL,
  "home_phone" TEXT NOT NULL,
  "mobile" TEXT NOT NULL,
  "birthdate" TEXT NOT NULL,
  "birthplace" TEXT NOT NULL,
  "age_october" TEXT NOT NULL,
  "national_id" TEXT NOT NULL,
  "id_issuing_authority" TEXT NOT NULL,
  "id_issue_date" TEXT NOT NULL,
  "guardian_name" TEXT NOT NULL,
  "guardian_job" TEXT NOT NULL,
  "guardian_address" TEXT NOT NULL,
  "guardian_mobile" TEXT NOT NULL,
  "certificate" TEXT NOT NULL,
  "graduation_year" TEXT NOT NULL,
  "total_grades" TEXT NOT NULL,
  "first_language" TEXT NOT NULL,
  "second_language" TEXT NOT NULL,
  "school" TEXT NOT NULL,
  "division" TEXT NOT NULL,
  "educational_district" TEXT NOT NULL,
  "governorate" TEXT NOT NULL,
  "photo_key" TEXT NOT NULL,
  "photo_content_type" TEXT NOT NULL,
  "photo_size" INTEGER NOT NULL,
  "certificate_key" TEXT NOT NULL,
  "certificate_size" INTEGER NOT NULL,
  "declaration_accepted_at" TEXT NOT NULL,
  "submitter_ip" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_applications_group_created"
  ON "applications" ("group_id", "created_at" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_applications_group_national_id"
  ON "applications" ("group_id", "national_id");
