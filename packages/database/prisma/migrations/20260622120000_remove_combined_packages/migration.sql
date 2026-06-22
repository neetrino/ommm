-- Remove legacy COMBINED package model (no data: 0 combined plans/components).

-- 1) Drop the combined components table (FKs/indexes drop with it).
DROP TABLE IF EXISTS "CombinedPlanComponent";

-- 2) Replace the plan listing index that referenced planType.
DROP INDEX IF EXISTS "PackagePlan_isActive_planType_displayOrder_idx";
CREATE INDEX IF NOT EXISTS "PackagePlan_isActive_displayOrder_idx"
  ON "PackagePlan" ("isActive", "displayOrder");

-- 3) Drop the planType column and its enum.
ALTER TABLE "PackagePlan" DROP COLUMN IF EXISTS "planType";
DROP TYPE IF EXISTS "PackagePlanType";
