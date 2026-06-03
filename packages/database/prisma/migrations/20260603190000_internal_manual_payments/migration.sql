-- Remove Stripe-specific payment storage and add internal/manual payment fulfillment metadata.

CREATE TYPE "PaymentSource" AS ENUM ('PACKAGE', 'DROPIN', 'GIFT', 'OTHER');

ALTER TABLE "Payment"
  RENAME COLUMN "stripePaymentId" TO "paymentReference";

ALTER INDEX IF EXISTS "Payment_stripePaymentId_key" RENAME TO "Payment_paymentReference_key";

ALTER TABLE "Payment"
  ADD COLUMN "source" "PaymentSource" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN "sourceId" TEXT,
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "confirmedByAdminId" TEXT;

UPDATE "Payment"
SET "source" = CASE
  WHEN "description" ILIKE 'Package%' OR "description" ILIKE 'Membership%' THEN 'PACKAGE'::"PaymentSource"
  WHEN "description" ILIKE 'Drop-in%' THEN 'DROPIN'::"PaymentSource"
  WHEN "description" ILIKE 'Gift%' THEN 'GIFT'::"PaymentSource"
  ELSE 'OTHER'::"PaymentSource"
END;

CREATE INDEX "Payment_source_sourceId_idx" ON "Payment"("source", "sourceId");

DROP INDEX IF EXISTS "User_stripeCustomerId_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeCustomerId";

ALTER TABLE "PackagePlan" DROP COLUMN IF EXISTS "stripePriceId";

DROP INDEX IF EXISTS "UserPackage_stripeSubscriptionId_key";
ALTER TABLE "UserPackage" DROP COLUMN IF EXISTS "stripeSubscriptionId";

DROP INDEX IF EXISTS "GiftCard_stripePaymentId_key";
ALTER TABLE "GiftCard" DROP COLUMN IF EXISTS "stripePaymentId";
