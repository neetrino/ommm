-- Backfill legacy rows, then enforce NOT NULL (column may already exist as nullable).
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "email" TEXT;

UPDATE "ContactMessage"
SET "email" = 'legacy@contact.local'
WHERE "email" IS NULL OR TRIM("email") = '';

ALTER TABLE "ContactMessage" ALTER COLUMN "email" SET NOT NULL;
