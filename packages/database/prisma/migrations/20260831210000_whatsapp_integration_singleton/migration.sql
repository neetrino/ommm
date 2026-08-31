-- Enforce a single WhatsApp Gateway credentials row.
ALTER TABLE "WhatsappIntegration" ADD COLUMN "key" TEXT;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "updatedAt" DESC, "createdAt" DESC) AS rn
  FROM "WhatsappIntegration"
)
UPDATE "WhatsappIntegration" AS w
SET "key" = 'default'
FROM ranked
WHERE w.id = ranked.id AND ranked.rn = 1;

DELETE FROM "WhatsappIntegration" WHERE "key" IS NULL;

ALTER TABLE "WhatsappIntegration" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "WhatsappIntegration" ALTER COLUMN "key" SET DEFAULT 'default';

CREATE UNIQUE INDEX "WhatsappIntegration_key_key" ON "WhatsappIntegration"("key");
