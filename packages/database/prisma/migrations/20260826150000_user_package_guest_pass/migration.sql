-- AlterTable
ALTER TABLE "UserPackage" ADD COLUMN "guestSlotsTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserPackage" ADD COLUMN "guestSlotsRemaining" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BookingConsumption" ADD COLUMN "consumedGuestSlots" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "guestName" TEXT;
ALTER TABLE "Booking" ADD COLUMN "guestPassSlot" INTEGER NOT NULL DEFAULT 0;

-- DropIndex
DROP INDEX "Booking_userId_sessionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Booking_userId_sessionId_guestPassSlot_key"
  ON "Booking"("userId", "sessionId", "guestPassSlot");
