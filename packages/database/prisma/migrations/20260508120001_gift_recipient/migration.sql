-- AlterTable
ALTER TABLE "GiftCard" ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT;
ALTER TABLE "GiftCard" ADD COLUMN IF NOT EXISTS "recipientName" TEXT;
ALTER TABLE "GiftCard" ADD COLUMN IF NOT EXISTS "stripePaymentId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "GiftCard_stripePaymentId_key" ON "GiftCard"("stripePaymentId");
