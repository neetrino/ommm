-- Promo codes: admin-managed coupons, eligibility, and a historical redemption snapshot.

CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE "CouponStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');
CREATE TYPE "CouponProductKind" AS ENUM ('PACKAGE', 'DROPIN', 'GIFT', 'BAR', 'OTHER');
CREATE TYPE "CouponRedemptionStatus" AS ENUM ('RESERVED', 'APPLIED', 'RELEASED');

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountType" "CouponDiscountType" NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "validFrom" TIMESTAMP(3),
  "validUntil" TIMESTAMP(3),
  "totalUsageLimit" INTEGER,
  "usageLimitPerUser" INTEGER,
  "eligibleAllUsers" BOOLEAN NOT NULL DEFAULT true,
  "eligibleAllProducts" BOOLEAN NOT NULL DEFAULT true,
  "status" "CouponStatus" NOT NULL DEFAULT 'DRAFT',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_status_validUntil_idx" ON "Coupon"("status", "validUntil");
CREATE INDEX "Coupon_createdById_idx" ON "Coupon"("createdById");

CREATE TABLE "CouponEligibleUser" (
  "couponId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "CouponEligibleUser_pkey" PRIMARY KEY ("couponId", "userId")
);

CREATE INDEX "CouponEligibleUser_userId_idx" ON "CouponEligibleUser"("userId");

CREATE TABLE "CouponEligibleProduct" (
  "id" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "productKind" "CouponProductKind" NOT NULL,
  "packagePlanId" TEXT,
  CONSTRAINT "CouponEligibleProduct_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CouponEligibleProduct_couponId_idx" ON "CouponEligibleProduct"("couponId");
CREATE INDEX "CouponEligibleProduct_packagePlanId_idx" ON "CouponEligibleProduct"("packagePlanId");

CREATE TABLE "CouponRedemption" (
  "id" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "status" "CouponRedemptionStatus" NOT NULL DEFAULT 'RESERVED',
  "code" TEXT NOT NULL,
  "discountType" "CouponDiscountType" NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "originalAmountCents" INTEGER NOT NULL,
  "discountAmountCents" INTEGER NOT NULL,
  "remainderGiftCents" INTEGER NOT NULL DEFAULT 0,
  "finalAmountCents" INTEGER NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CouponRedemption_paymentId_key" ON "CouponRedemption"("paymentId");
CREATE INDEX "CouponRedemption_couponId_status_idx" ON "CouponRedemption"("couponId", "status");
CREATE INDEX "CouponRedemption_userId_couponId_status_idx" ON "CouponRedemption"("userId", "couponId", "status");
CREATE INDEX "CouponRedemption_createdById_appliedAt_idx" ON "CouponRedemption"("createdById", "appliedAt");
CREATE INDEX "CouponRedemption_appliedAt_idx" ON "CouponRedemption"("appliedAt");

ALTER TABLE "Coupon"
  ADD CONSTRAINT "Coupon_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CouponEligibleUser"
  ADD CONSTRAINT "CouponEligibleUser_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponEligibleUser"
  ADD CONSTRAINT "CouponEligibleUser_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponEligibleProduct"
  ADD CONSTRAINT "CouponEligibleProduct_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponEligibleProduct"
  ADD CONSTRAINT "CouponEligibleProduct_packagePlanId_fkey"
  FOREIGN KEY ("packagePlanId") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
