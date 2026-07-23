-- CreateEnum
CREATE TYPE "ScheduleDayOfWeek" AS ENUM (
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
);

-- CreateTable
CREATE TABLE "ScheduleItem" (
  "id" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "instructorName" TEXT NOT NULL,
  "classType" TEXT NOT NULL,
  "dayOfWeek" "ScheduleDayOfWeek" NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT,
  "durationMinutes" INTEGER,
  "availableSpots" INTEGER NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleItem_isActive_dayOfWeek_startTime_idx" ON "ScheduleItem"("isActive", "dayOfWeek", "startTime");
