-- Remove package-specific tables and relations (Packages module cleanup).

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_planId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_userPackageId_fkey";
DROP INDEX IF EXISTS "Payment_planId_status_idx";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "planId";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "userPackageId";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "paymentMethod";

DROP TABLE IF EXISTS "UserPackage" CASCADE;
DROP TABLE IF EXISTS "PackagePlan" CASCADE;

DROP TYPE IF EXISTS "PackageStatus";
DROP TYPE IF EXISTS "ManualPaymentMethod";
