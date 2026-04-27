CREATE TABLE IF NOT EXISTS "schedule_levels" (
  "level" INTEGER PRIMARY KEY,
  "drive_url" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "updated_by" TEXT REFERENCES "user"("id")
);

INSERT OR IGNORE INTO "schedule_levels" ("level", "drive_url", "updated_at") VALUES
  (1, 'https://drive.google.com/file/d/1jTnhBA7CO2Hx1DsLhVKeO7Z7D08TfhmE/preview', datetime('now')),
  (2, 'https://drive.google.com/file/d/1jTnhBA7CO2Hx1DsLhVKeO7Z7D08TfhmE/preview', datetime('now')),
  (3, 'https://drive.google.com/file/d/1jTnhBA7CO2Hx1DsLhVKeO7Z7D08TfhmE/preview', datetime('now')),
  (4, 'https://drive.google.com/file/d/1jTnhBA7CO2Hx1DsLhVKeO7Z7D08TfhmE/preview', datetime('now'));
