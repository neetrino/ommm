-- How a client account was created (self-serve vs Admin/Manager).
CREATE TYPE "ClientRegistrationSource" AS ENUM ('SELF', 'STAFF');

ALTER TABLE "User" ADD COLUMN "registrationSource" "ClientRegistrationSource" NOT NULL DEFAULT 'SELF';
ALTER TABLE "User" ADD COLUMN "registeredById" TEXT;

-- Backfill staff-created clients from existing CLIENT_CREATED audit rows.
UPDATE "User" AS u
SET
  "registrationSource" = 'STAFF',
  "registeredById" = a."actorId"
FROM "AuditLog" AS a
WHERE a.action = 'CLIENT_CREATED'
  AND a."entityType" = 'User'
  AND a."entityId" = u.id
  AND a."actorId" IS NOT NULL;

CREATE INDEX "User_registeredById_idx" ON "User"("registeredById");
CREATE INDEX "User_registrationSource_idx" ON "User"("registrationSource");

ALTER TABLE "User" ADD CONSTRAINT "User_registeredById_fkey"
  FOREIGN KEY ("registeredById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
