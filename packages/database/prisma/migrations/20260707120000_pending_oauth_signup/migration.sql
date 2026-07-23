-- CreateTable
CREATE TABLE "PendingOAuthSignup" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "providerEmail" TEXT NOT NULL,
    "providerEmailVerified" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingOAuthSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingOAuthSignup_tokenHash_key" ON "PendingOAuthSignup"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PendingOAuthSignup_provider_providerAccountId_key" ON "PendingOAuthSignup"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "PendingOAuthSignup_expiresAt_idx" ON "PendingOAuthSignup"("expiresAt");
