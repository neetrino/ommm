-- Preserve purchased package metadata when catalog plans are deleted.

ALTER TABLE "UserPackage" ADD COLUMN "sourcePlanIdSnapshot" TEXT;
ALTER TABLE "UserPackage" ADD COLUMN "planNameSnapshot" TEXT;
ALTER TABLE "UserPackage" ADD COLUMN "planCategoryNameSnapshot" TEXT;
ALTER TABLE "UserPackage" ADD COLUMN "planPriceCentsSnapshot" INTEGER;
ALTER TABLE "UserPackage" ADD COLUMN "planPeriodDaysSnapshot" INTEGER;
ALTER TABLE "UserPackage" ADD COLUMN "planIsUnlimitedSnapshot" BOOLEAN;
ALTER TABLE "UserPackage" ADD COLUMN "planSessionsPerMonthSnapshot" INTEGER;

UPDATE "UserPackage" AS up
SET
  "sourcePlanIdSnapshot" = pp."id",
  "planNameSnapshot" = pp."name",
  "planCategoryNameSnapshot" = pp."categoryName",
  "planPriceCentsSnapshot" = pp."priceCents",
  "planPeriodDaysSnapshot" = pp."periodDays",
  "planIsUnlimitedSnapshot" = pp."isUnlimited",
  "planSessionsPerMonthSnapshot" = pp."sessionsPerMonth"
FROM "PackagePlan" AS pp
WHERE up."planId" = pp."id";

ALTER TABLE "UserPackage" ALTER COLUMN "sourcePlanIdSnapshot" SET NOT NULL;
ALTER TABLE "UserPackage" ALTER COLUMN "planNameSnapshot" SET NOT NULL;
ALTER TABLE "UserPackage" ALTER COLUMN "planCategoryNameSnapshot" SET NOT NULL;
ALTER TABLE "UserPackage" ALTER COLUMN "planPriceCentsSnapshot" SET NOT NULL;
ALTER TABLE "UserPackage" ALTER COLUMN "planPeriodDaysSnapshot" SET NOT NULL;
ALTER TABLE "UserPackage" ALTER COLUMN "planIsUnlimitedSnapshot" SET NOT NULL;
ALTER TABLE "UserPackage" ALTER COLUMN "planPeriodDaysSnapshot" SET DEFAULT 30;
ALTER TABLE "UserPackage" ALTER COLUMN "planIsUnlimitedSnapshot" SET DEFAULT false;

ALTER TABLE "UserPackage" DROP CONSTRAINT "UserPackage_planId_fkey";
ALTER TABLE "UserPackage" ALTER COLUMN "planId" DROP NOT NULL;
ALTER TABLE "UserPackage"
  ADD CONSTRAINT "UserPackage_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "PackagePlan"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "UserPackage_sourcePlanIdSnapshot_idx" ON "UserPackage"("sourcePlanIdSnapshot");
