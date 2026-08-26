-- AlterTable
ALTER TABLE "StaffActivityNotification" ADD COLUMN "coachProfileId" TEXT;
ALTER TABLE "StaffActivityNotification" ADD COLUMN "coachReadAt" TIMESTAMP(3);

-- Backfill coach from the linked session when the booking still exists
UPDATE "StaffActivityNotification" AS n
SET "coachProfileId" = s."coachId"
FROM "Booking" AS b
INNER JOIN "ClassSession" AS s ON s."id" = b."sessionId"
WHERE n."bookingId" = b."id";

-- CreateIndex
CREATE INDEX "StaffActivityNotification_coachProfileId_coachReadAt_createdAt_idx"
  ON "StaffActivityNotification"("coachProfileId", "coachReadAt", "createdAt");

-- AddForeignKey
ALTER TABLE "StaffActivityNotification"
  ADD CONSTRAINT "StaffActivityNotification_coachProfileId_fkey"
  FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
