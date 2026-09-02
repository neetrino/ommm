-- Who cancelled a booking (Admin / Manager staff cancel).
ALTER TABLE "Booking" ADD COLUMN "cancelledByUserId" TEXT;

CREATE INDEX "Booking_cancelledByUserId_idx" ON "Booking"("cancelledByUserId");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cancelledByUserId_fkey"
  FOREIGN KEY ("cancelledByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
