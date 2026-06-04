-- Manual / fake package payment requests (offline methods, admin confirmation).

CREATE TYPE "ManualPaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'OTHER');

ALTER TYPE "MembershipStatus" ADD VALUE 'PENDING';

ALTER TABLE "Payment" ADD COLUMN "planId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "paymentMethod" "ManualPaymentMethod";
ALTER TABLE "Payment" ADD COLUMN "membershipId" TEXT;

CREATE UNIQUE INDEX "Payment_membershipId_key" ON "Payment"("membershipId");
CREATE INDEX "Payment_planId_status_idx" ON "Payment"("planId", "status");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "UserMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
