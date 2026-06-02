-- Package categories are independent of the class type catalog.
ALTER TABLE "PackagePlan" ADD COLUMN IF NOT EXISTS "categoryName" TEXT NOT NULL DEFAULT 'General';
