-- Admin-created gift-card inventory has no purchaser.
-- Purchaser is recorded only for real member purchases.

ALTER TABLE "GiftCardBatch" DROP CONSTRAINT "GiftCardBatch_purchaserId_fkey";
ALTER TABLE "GiftCardBatch" ALTER COLUMN "purchaserId" DROP NOT NULL;
ALTER TABLE "GiftCardBatch" ADD CONSTRAINT "GiftCardBatch_purchaserId_fkey"
FOREIGN KEY ("purchaserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_purchaserId_fkey";
ALTER TABLE "GiftCard" ALTER COLUMN "purchaserId" DROP NOT NULL;
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_purchaserId_fkey"
FOREIGN KEY ("purchaserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "GiftCardBatch" AS batch
SET "purchaserId" = NULL
FROM "User" AS u
WHERE batch."purchaserId" = u.id
  AND u.role IN ('ADMIN', 'MANAGER', 'CONTENT_ADMIN');

UPDATE "GiftCard" AS card
SET "purchaserId" = NULL
FROM "User" AS u
WHERE card."purchaserId" = u.id
  AND u.role IN ('ADMIN', 'MANAGER', 'CONTENT_ADMIN');
