-- Staff can remove a client's package without deleting existing bookings.

ALTER TABLE "UserPackage" ADD COLUMN "removedAt" TIMESTAMP(3);
ALTER TABLE "UserPackage" ADD COLUMN "removedByUserId" TEXT;

CREATE INDEX "UserPackage_removedAt_idx" ON "UserPackage"("removedAt");

ALTER TABLE "UserPackage" ADD CONSTRAINT "UserPackage_removedByUserId_fkey"
  FOREIGN KEY ("removedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
