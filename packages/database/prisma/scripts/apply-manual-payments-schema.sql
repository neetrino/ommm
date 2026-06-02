-- Idempotent: manual package payment columns (safe to re-run).

DO $$ BEGIN
  CREATE TYPE "ManualPaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "PackageStatus" ADD VALUE IF NOT EXISTS 'PENDING';

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "planId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMethod" "ManualPaymentMethod";
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "userPackageId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_userPackageId_key" ON "Payment"("userPackageId");
CREATE INDEX IF NOT EXISTS "Payment_planId_status_idx" ON "Payment"("planId", "status");

DO $$ BEGIN
  ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "PackagePlan"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_userPackageId_fkey"
    FOREIGN KEY ("userPackageId") REFERENCES "UserPackage"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
