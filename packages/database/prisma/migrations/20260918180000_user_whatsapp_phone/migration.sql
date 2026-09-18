-- Dedicated WhatsApp recipient on the client card. Notifications fall back to `phone`.
ALTER TABLE "User" ADD COLUMN "whatsappPhone" TEXT;
