CREATE TABLE IF NOT EXISTS "events" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "title_en" TEXT NOT NULL,
  "title_ar" TEXT NOT NULL,
  "description_en" TEXT NOT NULL,
  "description_ar" TEXT NOT NULL,
  "event_date" TEXT NOT NULL,
  "event_time" TEXT NOT NULL,
  "card_photo_key" TEXT,
  "author_id" TEXT NOT NULL REFERENCES "user"("id"),
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_events_event_date" ON "events" ("event_date" DESC);

CREATE TABLE IF NOT EXISTS "event_photos" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "event_id" INTEGER NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "photo_key" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_event_photos_event" ON "event_photos" ("event_id", "position");
