-- Idempotent: package session usage columns (UserPackage.sessionsTotal, Booking.userPackageId).

ALTER TABLE "UserPackage" ADD COLUMN IF NOT EXISTS "sessionsTotal" INTEGER;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "userPackageId" TEXT;

CREATE INDEX IF NOT EXISTS "Booking_userPackageId_idx" ON "Booking"("userPackageId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Booking_userPackageId_fkey'
  ) THEN
    ALTER TABLE "Booking"
      ADD CONSTRAINT "Booking_userPackageId_fkey"
      FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

UPDATE "UserPackage" AS up
SET "sessionsTotal" = GREATEST(
  COALESCE(pp."sessionsPerMonth", 0),
  COALESCE(up."sessionsRemaining", 0)
)
FROM "PackagePlan" AS pp
WHERE up."planId" = pp."id"
  AND up."sessionsTotal" IS NULL
  AND pp."isUnlimited" = false;
