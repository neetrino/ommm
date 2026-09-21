-- Class reminders are stored per booking + hours-before window (24h and 2h).
-- Table may already exist on prod from an earlier db push without a migration.

CREATE TABLE IF NOT EXISTS "ClassReminderSendLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "hoursBefore" INTEGER NOT NULL DEFAULT 2,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassReminderSendLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ClassReminderSendLog" ADD COLUMN IF NOT EXISTS "hoursBefore" INTEGER NOT NULL DEFAULT 2;

DROP INDEX IF EXISTS "ClassReminderSendLog_bookingId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "ClassReminderSendLog_bookingId_hoursBefore_key"
ON "ClassReminderSendLog"("bookingId", "hoursBefore");

CREATE INDEX IF NOT EXISTS "ClassReminderSendLog_bookingId_idx"
ON "ClassReminderSendLog"("bookingId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ClassReminderSendLog_bookingId_fkey'
  ) THEN
    ALTER TABLE "ClassReminderSendLog"
      ADD CONSTRAINT "ClassReminderSendLog_bookingId_fkey"
      FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
