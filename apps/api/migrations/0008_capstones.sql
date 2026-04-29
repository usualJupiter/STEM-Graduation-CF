CREATE TABLE IF NOT EXISTS "capstones" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "slug" TEXT NOT NULL UNIQUE,
  "title_en" TEXT NOT NULL,
  "title_ar" TEXT NOT NULL,
  "full_name_en" TEXT NOT NULL,
  "full_name_ar" TEXT NOT NULL,
  "level" INTEGER NOT NULL CHECK ("level" IN (1, 2, 3)),
  "semester" TEXT NOT NULL CHECK ("semester" IN ('first', 'second')),
  "abstract_en" TEXT NOT NULL,
  "abstract_ar" TEXT NOT NULL,
  "introduction_en" TEXT NOT NULL,
  "introduction_ar" TEXT NOT NULL,
  "methodology_en" TEXT NOT NULL,
  "methodology_ar" TEXT NOT NULL,
  "analysis_en" TEXT NOT NULL,
  "analysis_ar" TEXT NOT NULL,
  "conclusion_en" TEXT NOT NULL,
  "conclusion_ar" TEXT NOT NULL,
  "recommendations_en" TEXT NOT NULL,
  "recommendations_ar" TEXT NOT NULL,
  "card_photo_key" TEXT,
  "producers_photo_key" TEXT,
  "poster_link" TEXT,
  "portfolio_link" TEXT,
  "presentation_link" TEXT,
  "author_id" TEXT NOT NULL REFERENCES "user"("id"),
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_capstones_level" ON "capstones" ("level", "id" DESC);
CREATE INDEX IF NOT EXISTS "idx_capstones_created_at" ON "capstones" ("created_at" DESC);

CREATE TABLE IF NOT EXISTS "capstone_people" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "capstone_id" INTEGER NOT NULL REFERENCES "capstones"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL CHECK ("role" IN ('student', 'supervisor')),
  "name_en" TEXT NOT NULL,
  "name_ar" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_capstone_people" ON "capstone_people" ("capstone_id", "role", "position");

CREATE TABLE IF NOT EXISTS "capstone_materials" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "capstone_id" INTEGER NOT NULL REFERENCES "capstones"("id") ON DELETE CASCADE,
  "name_en" TEXT NOT NULL,
  "name_ar" TEXT NOT NULL,
  "photo_key" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_capstone_materials" ON "capstone_materials" ("capstone_id", "position");

CREATE TABLE IF NOT EXISTS "capstone_photos" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "capstone_id" INTEGER NOT NULL REFERENCES "capstones"("id") ON DELETE CASCADE,
  "photo_key" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_capstone_photos" ON "capstone_photos" ("capstone_id", "position");
