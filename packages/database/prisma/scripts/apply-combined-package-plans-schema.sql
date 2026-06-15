-- Idempotent: combined package plan columns and PackagePlanComponent table.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PackagePlanType') THEN
    CREATE TYPE "PackagePlanType" AS ENUM ('SINGLE', 'COMBINED');
  END IF;
END $$;

ALTER TABLE "PackagePlan"
  ADD COLUMN IF NOT EXISTS "planType" "PackagePlanType" NOT NULL DEFAULT 'SINGLE';

ALTER TABLE "PackagePlan"
  ADD COLUMN IF NOT EXISTS "allowedCategoryNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE IF NOT EXISTS "PackagePlanComponent" (
  "id" TEXT NOT NULL,
  "combinedPackagePlanId" TEXT NOT NULL,
  "sourcePackagePlanId" TEXT,
  "sourcePackageNameSnapshot" TEXT NOT NULL,
  "sourceCategoryNameSnapshot" TEXT NOT NULL,
  "sourceClassTypeIdSnapshot" TEXT,
  "sessionsPerMonthSnapshot" INTEGER,
  "sessionAllocation" INTEGER,
  "isUnlimitedSnapshot" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PackagePlanComponent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PackagePlanComponent"
  ADD COLUMN IF NOT EXISTS "sessionAllocation" INTEGER;

CREATE INDEX IF NOT EXISTS "PackagePlanComponent_combinedPackagePlanId_idx"
  ON "PackagePlanComponent"("combinedPackagePlanId");

CREATE INDEX IF NOT EXISTS "PackagePlanComponent_sourcePackagePlanId_idx"
  ON "PackagePlanComponent"("sourcePackagePlanId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PackagePlanComponent_combinedPackagePlanId_fkey'
  ) THEN
    ALTER TABLE "PackagePlanComponent"
      ADD CONSTRAINT "PackagePlanComponent_combinedPackagePlanId_fkey"
      FOREIGN KEY ("combinedPackagePlanId") REFERENCES "PackagePlan"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PackagePlanComponent_sourcePackagePlanId_fkey'
  ) THEN
    ALTER TABLE "PackagePlanComponent"
      ADD CONSTRAINT "PackagePlanComponent_sourcePackagePlanId_fkey"
      FOREIGN KEY ("sourcePackagePlanId") REFERENCES "PackagePlan"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

UPDATE "PackagePlan"
SET "allowedCategoryNames" = ARRAY["categoryName"]
WHERE "planType" = 'SINGLE'
  AND cardinality("allowedCategoryNames") = 0
  AND trim("categoryName") <> '';
