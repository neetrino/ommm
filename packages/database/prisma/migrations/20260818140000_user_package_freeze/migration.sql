-- AlterTable
ALTER TABLE "PackagePlan" ADD COLUMN "freezeAllowedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PackagePlan" ADD COLUMN "freezeMaxDaysPerUse" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserPackage" ADD COLUMN "freezeAllowedCountSnapshot" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserPackage" ADD COLUMN "freezeMaxDaysPerUseSnapshot" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserPackage" ADD COLUMN "freezesUsedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserPackage" ADD COLUMN "pausedAt" TIMESTAMP(3);
ALTER TABLE "UserPackage" ADD COLUMN "pausedUntil" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "UserPackageFreezeInitiator" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "UserPackageFreezeStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "UserPackageFreeze" (
    "id" TEXT NOT NULL,
    "userPackageId" TEXT NOT NULL,
    "daysRequested" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "initiatedBy" "UserPackageFreezeInitiator" NOT NULL,
    "initiatedByUserId" TEXT,
    "status" "UserPackageFreezeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPackageFreeze_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPackage_status_pausedUntil_idx" ON "UserPackage"("status", "pausedUntil");

-- CreateIndex
CREATE INDEX "UserPackageFreeze_userPackageId_status_idx" ON "UserPackageFreeze"("userPackageId", "status");

-- CreateIndex
CREATE INDEX "UserPackageFreeze_status_scheduledEndAt_idx" ON "UserPackageFreeze"("status", "scheduledEndAt");

-- AddForeignKey
ALTER TABLE "UserPackageFreeze" ADD CONSTRAINT "UserPackageFreeze_userPackageId_fkey" FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPackageFreeze" ADD CONSTRAINT "UserPackageFreeze_initiatedByUserId_fkey" FOREIGN KEY ("initiatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
