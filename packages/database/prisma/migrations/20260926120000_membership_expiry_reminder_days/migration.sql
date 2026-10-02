-- Expiry WhatsApp is once per window (7 days and 1 day), not once per package.
ALTER TABLE "MembershipExpiryReminderSendLog" ADD COLUMN IF NOT EXISTS "daysBefore" INTEGER;

UPDATE "MembershipExpiryReminderSendLog"
SET "daysBefore" = 1
WHERE "daysBefore" IS NULL;

DROP INDEX IF EXISTS "MembershipExpiryReminderSendLog_userPackageId_key";

INSERT INTO "MembershipExpiryReminderSendLog" ("id", "userPackageId", "daysBefore", "sentAt")
SELECT src."id" || ':7', src."userPackageId", 7, src."sentAt"
FROM "MembershipExpiryReminderSendLog" src
WHERE src."daysBefore" = 1
  AND NOT EXISTS (
    SELECT 1
    FROM "MembershipExpiryReminderSendLog" existing
    WHERE existing."userPackageId" = src."userPackageId"
      AND existing."daysBefore" = 7
  );

ALTER TABLE "MembershipExpiryReminderSendLog"
  ALTER COLUMN "daysBefore" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "MembershipExpiryReminderSendLog_userPackageId_daysBefore_key"
ON "MembershipExpiryReminderSendLog"("userPackageId", "daysBefore");

CREATE INDEX IF NOT EXISTS "MembershipExpiryReminderSendLog_userPackageId_idx"
ON "MembershipExpiryReminderSendLog"("userPackageId");
