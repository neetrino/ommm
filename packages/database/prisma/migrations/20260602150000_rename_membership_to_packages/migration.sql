-- Rename membership-* database objects to packages terminology.

ALTER TYPE "MembershipStatus" RENAME TO "PackageStatus";

ALTER TABLE "MembershipPlan" RENAME TO "PackagePlan";
ALTER TABLE "UserMembership" RENAME TO "UserPackage";

ALTER TABLE "Payment" RENAME COLUMN "membershipId" TO "userPackageId";

ALTER INDEX "MembershipPlan_slug_key" RENAME TO "PackagePlan_slug_key";
ALTER INDEX IF EXISTS "MembershipPlan_classTypeId_idx" RENAME TO "PackagePlan_classTypeId_idx";
ALTER INDEX "UserMembership_stripeSubscriptionId_key" RENAME TO "UserPackage_stripeSubscriptionId_key";
ALTER INDEX "UserMembership_userId_idx" RENAME TO "UserPackage_userId_idx";
ALTER INDEX "Payment_membershipId_key" RENAME TO "Payment_userPackageId_key";

ALTER TABLE "PackagePlan" RENAME CONSTRAINT "MembershipPlan_pkey" TO "PackagePlan_pkey";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'MembershipPlan_classTypeId_fkey'
  ) THEN
    ALTER TABLE "PackagePlan"
      RENAME CONSTRAINT "MembershipPlan_classTypeId_fkey" TO "PackagePlan_classTypeId_fkey";
  END IF;
END $$;

ALTER TABLE "UserPackage" RENAME CONSTRAINT "UserMembership_pkey" TO "UserPackage_pkey";
ALTER TABLE "UserPackage" RENAME CONSTRAINT "UserMembership_userId_fkey" TO "UserPackage_userId_fkey";
ALTER TABLE "UserPackage" RENAME CONSTRAINT "UserMembership_planId_fkey" TO "UserPackage_planId_fkey";
ALTER TABLE "Payment" RENAME CONSTRAINT "Payment_membershipId_fkey" TO "Payment_userPackageId_fkey";
