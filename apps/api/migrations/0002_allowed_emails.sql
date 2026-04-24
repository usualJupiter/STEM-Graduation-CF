CREATE TABLE IF NOT EXISTS "allowed_emails" (
  "email" TEXT PRIMARY KEY NOT NULL,
  "addedByUserId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "addedAt" TEXT NOT NULL
);
