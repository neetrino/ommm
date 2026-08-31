-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "BookingConfirmedSendLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingConfirmedSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagePurchasedSendLog" (
    "id" TEXT NOT NULL,
    "userPackageId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackagePurchasedSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipExpiryReminderSendLog" (
    "id" TEXT NOT NULL,
    "userPackageId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipExpiryReminderSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingConfirmedSendLog_bookingId_key" ON "BookingConfirmedSendLog"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "PackagePurchasedSendLog_userPackageId_key" ON "PackagePurchasedSendLog"("userPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipExpiryReminderSendLog_userPackageId_key" ON "MembershipExpiryReminderSendLog"("userPackageId");

-- AddForeignKey
ALTER TABLE "BookingConfirmedSendLog" ADD CONSTRAINT "BookingConfirmedSendLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePurchasedSendLog" ADD CONSTRAINT "PackagePurchasedSendLog_userPackageId_fkey" FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipExpiryReminderSendLog" ADD CONSTRAINT "MembershipExpiryReminderSendLog_userPackageId_fkey" FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
