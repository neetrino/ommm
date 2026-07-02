-- Stable unique key per package group; display name (categoryName) may repeat.
ALTER TABLE "PackagePlan" ADD COLUMN "categorySlug" TEXT;

UPDATE "PackagePlan"
SET "categorySlug" = "slug"
WHERE "priceCents" = 0;

UPDATE "PackagePlan" AS plan
SET "categorySlug" = COALESCE(
  (
    SELECT shell."slug"
    FROM "PackagePlan" AS shell
    WHERE shell."categoryName" = plan."categoryName"
      AND shell."priceCents" = 0
      AND shell."categorySlug" IS NOT NULL
    ORDER BY shell."createdAt" ASC
    LIMIT 1
  ),
  (
    SELECT peer."categorySlug"
    FROM "PackagePlan" AS peer
    WHERE peer."categoryName" = plan."categoryName"
      AND peer."categorySlug" IS NOT NULL
    ORDER BY peer."createdAt" ASC
    LIMIT 1
  ),
  plan."slug"
)
WHERE plan."categorySlug" IS NULL;

ALTER TABLE "PackagePlan" ALTER COLUMN "categorySlug" SET NOT NULL;

CREATE INDEX "PackagePlan_categorySlug_displayOrder_idx" ON "PackagePlan"("categorySlug", "displayOrder");
