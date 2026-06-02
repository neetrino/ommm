-- Idempotent: align legacy membership tables with PackagePlan / UserPackage schema.

-- Ensure PENDING exists on legacy enum (no-op after rename).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MembershipStatus') THEN
    ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'PENDING';
  ELSIF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PackageStatus') THEN
    ALTER TYPE "PackageStatus" ADD VALUE IF NOT EXISTS 'PENDING';
  END IF;
END $$;

-- classTypeId on plan table (before or after rename).
DO $$ BEGIN
  IF to_regclass('public."MembershipPlan"') IS NOT NULL THEN
    ALTER TABLE "MembershipPlan" ADD COLUMN IF NOT EXISTS "classTypeId" TEXT;
  ELSIF to_regclass('public."PackagePlan"') IS NOT NULL THEN
    ALTER TABLE "PackagePlan" ADD COLUMN IF NOT EXISTS "classTypeId" TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'MembershipPlan_classTypeId_idx'
  ) AND to_regclass('public."MembershipPlan"') IS NOT NULL THEN
    CREATE INDEX "MembershipPlan_classTypeId_idx" ON "MembershipPlan"("classTypeId");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'PackagePlan_classTypeId_idx'
  ) AND to_regclass('public."PackagePlan"') IS NOT NULL THEN
    CREATE INDEX "PackagePlan_classTypeId_idx" ON "PackagePlan"("classTypeId");
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MembershipPlan_classTypeId_fkey'
  ) THEN
    NULL;
  ELSIF to_regclass('public."MembershipPlan"') IS NOT NULL THEN
    ALTER TABLE "MembershipPlan"
      ADD CONSTRAINT "MembershipPlan_classTypeId_fkey"
      FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PackagePlan_classTypeId_fkey'
  ) THEN
    NULL;
  ELSIF to_regclass('public."PackagePlan"') IS NOT NULL THEN
    ALTER TABLE "PackagePlan"
      ADD CONSTRAINT "PackagePlan_classTypeId_fkey"
      FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Rename enum and tables when still on legacy names.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MembershipStatus') THEN
    ALTER TYPE "MembershipStatus" RENAME TO "PackageStatus";
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public."MembershipPlan"') IS NOT NULL THEN
    ALTER TABLE "MembershipPlan" RENAME TO "PackagePlan";
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public."UserMembership"') IS NOT NULL THEN
    ALTER TABLE "UserMembership" RENAME TO "UserPackage";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Payment'
      AND column_name = 'membershipId'
  ) THEN
    ALTER TABLE "Payment" RENAME COLUMN "membershipId" TO "userPackageId";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'MembershipPlan_slug_key') THEN
    ALTER INDEX "MembershipPlan_slug_key" RENAME TO "PackagePlan_slug_key";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'MembershipPlan_classTypeId_idx') THEN
    ALTER INDEX "MembershipPlan_classTypeId_idx" RENAME TO "PackagePlan_classTypeId_idx";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UserMembership_stripeSubscriptionId_key') THEN
    ALTER INDEX "UserMembership_stripeSubscriptionId_key" RENAME TO "UserPackage_stripeSubscriptionId_key";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UserMembership_userId_idx') THEN
    ALTER INDEX "UserMembership_userId_idx" RENAME TO "UserPackage_userId_idx";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Payment_membershipId_key') THEN
    ALTER INDEX "Payment_membershipId_key" RENAME TO "Payment_userPackageId_key";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MembershipPlan_pkey') THEN
    ALTER TABLE "PackagePlan" RENAME CONSTRAINT "MembershipPlan_pkey" TO "PackagePlan_pkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MembershipPlan_classTypeId_fkey') THEN
    ALTER TABLE "PackagePlan"
      RENAME CONSTRAINT "MembershipPlan_classTypeId_fkey" TO "PackagePlan_classTypeId_fkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserMembership_pkey') THEN
    ALTER TABLE "UserPackage" RENAME CONSTRAINT "UserMembership_pkey" TO "UserPackage_pkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserMembership_userId_fkey') THEN
    ALTER TABLE "UserPackage" RENAME CONSTRAINT "UserMembership_userId_fkey" TO "UserPackage_userId_fkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserMembership_planId_fkey') THEN
    ALTER TABLE "UserPackage" RENAME CONSTRAINT "UserMembership_planId_fkey" TO "UserPackage_planId_fkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_membershipId_fkey') THEN
    ALTER TABLE "Payment" RENAME CONSTRAINT "Payment_membershipId_fkey" TO "Payment_userPackageId_fkey";
  END IF;
END $$;
