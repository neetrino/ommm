-- CreateTable
CREATE TABLE "WhatsappIntegration" (
    "id" TEXT NOT NULL,
    "gatewayUrl" TEXT,
    "gatewayToken" TEXT,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappIntegration_pkey" PRIMARY KEY ("id")
);
