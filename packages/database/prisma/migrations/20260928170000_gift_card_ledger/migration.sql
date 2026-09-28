-- Gift card type, class balance, activation time, and an append-only ledger.

CREATE TYPE "GiftCardType" AS ENUM ('FIXED_VALUE', 'FIXED_CLASS');
CREATE TYPE "GiftCardTransactionKind" AS ENUM ('ISSUE', 'REDEEM', 'SPEND', 'REFUND', 'ADJUST', 'EXPIRE');

ALTER TABLE "GiftCard" ADD COLUMN "type" "GiftCardType" NOT NULL DEFAULT 'FIXED_VALUE';
ALTER TABLE "GiftCard" ADD COLUMN "classTypeId" TEXT;
ALTER TABLE "GiftCard" ADD COLUMN "classQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GiftCard" ADD COLUMN "balanceClasses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GiftCard" ADD COLUMN "redeemedAt" TIMESTAMP(3);

ALTER TABLE "GiftCardBatch" ADD COLUMN "type" "GiftCardType" NOT NULL DEFAULT 'FIXED_VALUE';
ALTER TABLE "GiftCardBatch" ADD COLUMN "classTypeId" TEXT;
ALTER TABLE "GiftCardBatch" ADD COLUMN "classQuantity" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "StudioSettings" ADD COLUMN "giftCardMinAmountAmd" INTEGER NOT NULL DEFAULT 30000;
ALTER TABLE "StudioSettings" ADD COLUMN "giftCardValidityMonths" INTEGER NOT NULL DEFAULT 12;
ALTER TABLE "StudioSettings" ADD COLUMN "giftCardDenominationsJson" TEXT NOT NULL DEFAULT '[40000,70000,100000]';

CREATE INDEX "GiftCard_recipientId_status_idx" ON "GiftCard"("recipientId", "status");
CREATE INDEX "GiftCard_classTypeId_idx" ON "GiftCard"("classTypeId");
CREATE INDEX "GiftCardBatch_classTypeId_idx" ON "GiftCardBatch"("classTypeId");

ALTER TABLE "GiftCard"
  ADD CONSTRAINT "GiftCard_classTypeId_fkey"
  FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GiftCardBatch"
  ADD CONSTRAINT "GiftCardBatch_classTypeId_fkey"
  FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "GiftCardTransaction" (
  "id" TEXT NOT NULL,
  "giftCardId" TEXT NOT NULL,
  "kind" "GiftCardTransactionKind" NOT NULL,
  "userId" TEXT,
  "orderId" TEXT,
  "amountCents" INTEGER NOT NULL DEFAULT 0,
  "classes" INTEGER NOT NULL DEFAULT 0,
  "balanceCentsAfter" INTEGER NOT NULL,
  "balanceClassesAfter" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GiftCardTransaction_giftCardId_createdAt_idx" ON "GiftCardTransaction"("giftCardId", "createdAt");
CREATE INDEX "GiftCardTransaction_userId_createdAt_idx" ON "GiftCardTransaction"("userId", "createdAt");
CREATE INDEX "GiftCardTransaction_orderId_idx" ON "GiftCardTransaction"("orderId");

ALTER TABLE "GiftCardTransaction"
  ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey"
  FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
