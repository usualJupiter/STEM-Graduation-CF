ALTER TABLE "allowed_emails" ADD COLUMN "is_default" INTEGER NOT NULL DEFAULT 0;

UPDATE "allowed_emails" SET "is_default" = 1 WHERE "email" = 'stemadminaccess@gmail.com';
