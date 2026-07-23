-- CreateEnum
CREATE TYPE "SessionRecurrencePattern" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'CUSTOM_WEEKDAYS');

-- AlterTable
ALTER TABLE "ClassSession"
ADD COLUMN "title" TEXT NOT NULL DEFAULT '',
ADD COLUMN "description" TEXT,
ADD COLUMN "classFormat" TEXT,
ADD COLUMN "sessionRequirement" INTEGER,
ADD COLUMN "recurrencePattern" "SessionRecurrencePattern" NOT NULL DEFAULT 'NONE',
ADD COLUMN "recurrenceWeekdays" "ScheduleDayOfWeek"[] NOT NULL DEFAULT ARRAY[]::"ScheduleDayOfWeek"[],
ADD COLUMN "recurrenceEndsAt" TIMESTAMP(3),
ADD COLUMN "recurrenceCount" INTEGER;
