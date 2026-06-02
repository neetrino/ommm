-- Idempotent: manual package payment columns (safe to re-run).

DO $$ BEGIN
  CREATE TYPE "ManualPaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'PENDING';

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "planId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMethod" "ManualPaymentMethod";
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "membershipId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_membershipId_key" ON "Payment"("membershipId");
CREATE INDEX IF NOT EXISTS "Payment_planId_status_idx" ON "Payment"("planId", "status");

DO $$ BEGIN
  ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_membershipId_fkey"
    FOREIGN KEY ("membershipId") REFERENCES "UserMembership"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
