-- CreateTable
CREATE TABLE "GiftCardBatch" (
    "id" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalQuantity" INTEGER NOT NULL,
    "availableQuantity" INTEGER NOT NULL,
    "purchaserId" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "message" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GiftCardBatch_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "GiftCard" ADD COLUMN "batchId" TEXT;

-- CreateIndex
CREATE INDEX "GiftCard_batchId_idx" ON "GiftCard"("batchId");

-- CreateIndex
CREATE INDEX "GiftCardBatch_status_createdAt_idx" ON "GiftCardBatch"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GiftCardBatch_purchaserId_idx" ON "GiftCardBatch"("purchaserId");

-- CreateIndex
CREATE INDEX "GiftCardBatch_recipientId_idx" ON "GiftCardBatch"("recipientId");

-- AddForeignKey
ALTER TABLE "GiftCard"
ADD CONSTRAINT "GiftCard_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "GiftCardBatch"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardBatch"
ADD CONSTRAINT "GiftCardBatch_purchaserId_fkey"
FOREIGN KEY ("purchaserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardBatch"
ADD CONSTRAINT "GiftCardBatch_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

