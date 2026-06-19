-- Reset legacy packages module data model.

-- 1) Detach package references from surviving tables.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Booking'
      AND column_name = 'userPackageId'
  ) THEN
    EXECUTE 'UPDATE "Booking" SET "userPackageId" = NULL WHERE "userPackageId" IS NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Payment'
      AND column_name = 'planId'
  ) THEN
    EXECUTE 'UPDATE "Payment" SET "planId" = NULL WHERE "planId" IS NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Payment'
      AND column_name = 'userPackageId'
  ) THEN
    EXECUTE 'UPDATE "Payment" SET "userPackageId" = NULL WHERE "userPackageId" IS NOT NULL';
  END IF;
END $$;

-- 2) Drop foreign keys / indexes that depend on package objects.
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_userPackageId_fkey";
DROP INDEX IF EXISTS "Booking_userPackageId_idx";

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_planId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_userPackageId_fkey";
DROP INDEX IF EXISTS "Payment_planId_status_idx";
DROP INDEX IF EXISTS "Payment_userPackageId_key";

-- 3) Drop package reference columns from surviving tables.
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "userPackageId";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "planId";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "userPackageId";

-- 4) Drop package tables.
DROP TABLE IF EXISTS "PackagePlanComponent";
DROP TABLE IF EXISTS "UserPackage";
DROP TABLE IF EXISTS "PackagePlan";

-- 5) Drop package enums.
DROP TYPE IF EXISTS "PackagePlanType";
DROP TYPE IF EXISTS "PackageStatus";
