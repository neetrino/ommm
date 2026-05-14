-- Alter membership plan with marketing-facing fields for public cards and admin management.
ALTER TABLE "MembershipPlan"
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN "billingPeriod" TEXT NOT NULL DEFAULT 'monthly',
ADD COLUMN "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "buttonLabel" TEXT NOT NULL DEFAULT 'Choose plan',
ADD COLUMN "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
