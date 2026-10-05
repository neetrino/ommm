-- Who created or rebooked a seat (member self-book or staff).
ALTER TABLE "Booking" ADD COLUMN "createdByUserId" TEXT;

CREATE INDEX "Booking_createdByUserId_idx" ON "Booking"("createdByUserId");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
