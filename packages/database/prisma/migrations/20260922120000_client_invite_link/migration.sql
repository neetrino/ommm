-- Personal client-invite codes for admins and managers, plus invite attribution.

ALTER TYPE "ClientRegistrationSource" ADD VALUE IF NOT EXISTS 'INVITE';

ALTER TABLE "User" ADD COLUMN "clientInviteCode" TEXT;

CREATE UNIQUE INDEX "User_clientInviteCode_key" ON "User"("clientInviteCode");

UPDATE "User"
SET "clientInviteCode" = substr(md5("id" || ':client-invite-v1'), 1, 16)
WHERE "role" IN ('ADMIN', 'MANAGER')
  AND "clientInviteCode" IS NULL;
