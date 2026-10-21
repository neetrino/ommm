-- One-time email code before a member closes their own account.
ALTER TYPE "AuthTokenType" ADD VALUE IF NOT EXISTS 'ACCOUNT_DELETION';

ALTER TABLE "AuthToken" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;
