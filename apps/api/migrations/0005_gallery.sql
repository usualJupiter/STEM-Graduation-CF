CREATE TABLE IF NOT EXISTS "gallery_photos" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "photo_key" TEXT NOT NULL UNIQUE,
  "file_size" INTEGER NOT NULL,
  "original_name" TEXT,
  "author_id" TEXT NOT NULL REFERENCES "user"("id"),
  "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_gallery_photos_created_at" ON "gallery_photos" ("created_at" DESC);
