-- CreateEnum
CREATE TYPE "BookingChannel" AS ENUM ('WEBSITE', 'APP');

-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "channel" "BookingChannel" NOT NULL DEFAULT 'WEBSITE';
