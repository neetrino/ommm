-- CreateEnum
CREATE TYPE "StaffActivityType" AS ENUM ('BOOKING_CREATED', 'BOOKING_CANCELLED');

-- CreateTable
CREATE TABLE "StaffActivityNotification" (
    "id" TEXT NOT NULL,
    "type" "StaffActivityType" NOT NULL,
    "bookingId" TEXT,
    "memberUserId" TEXT,
    "memberName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "sessionStartsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffReadAt" TIMESTAMP(3),

    CONSTRAINT "StaffActivityNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffActivityNotification_createdAt_idx" ON "StaffActivityNotification"("createdAt");

-- CreateIndex
CREATE INDEX "StaffActivityNotification_staffReadAt_createdAt_idx" ON "StaffActivityNotification"("staffReadAt", "createdAt");

-- CreateIndex
CREATE INDEX "StaffActivityNotification_type_createdAt_idx" ON "StaffActivityNotification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "StaffActivityNotification_bookingId_idx" ON "StaffActivityNotification"("bookingId");

-- CreateIndex
CREATE INDEX "StaffActivityNotification_memberUserId_idx" ON "StaffActivityNotification"("memberUserId");

-- AddForeignKey
ALTER TABLE "StaffActivityNotification" ADD CONSTRAINT "StaffActivityNotification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffActivityNotification" ADD CONSTRAINT "StaffActivityNotification_memberUserId_fkey" FOREIGN KEY ("memberUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
