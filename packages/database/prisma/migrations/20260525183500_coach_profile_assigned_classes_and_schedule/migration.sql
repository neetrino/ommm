-- AlterTable
ALTER TABLE "CoachProfile"
ADD COLUMN "assignedClassTypeIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "CoachAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "slotDate" TIMESTAMP(3) NOT NULL,
    "slotTime" TEXT NOT NULL,
    "availableSpots" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachAvailabilitySlot_coachProfileId_slotDate_slotTime_idx" ON "CoachAvailabilitySlot"("coachProfileId", "slotDate", "slotTime");

-- AddForeignKey
ALTER TABLE "CoachAvailabilitySlot"
ADD CONSTRAINT "CoachAvailabilitySlot_coachProfileId_fkey"
FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
