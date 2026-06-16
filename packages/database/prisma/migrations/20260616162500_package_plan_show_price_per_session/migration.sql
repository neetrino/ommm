-- AlterTable
ALTER TABLE "PackagePlan"
ADD COLUMN IF NOT EXISTS "showPricePerSession" BOOLEAN NOT NULL DEFAULT true;
