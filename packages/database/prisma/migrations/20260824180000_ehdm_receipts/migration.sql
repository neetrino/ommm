-- CreateTable
CREATE TABLE "EhdmState" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nextSeq" INTEGER NOT NULL,

    CONSTRAINT "EhdmState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EhdmReceipt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "fiscal" TEXT,
    "qr" TEXT,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EhdmReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EhdmReceipt_paymentId_key" ON "EhdmReceipt"("paymentId");

-- CreateIndex
CREATE INDEX "EhdmReceipt_receiptId_idx" ON "EhdmReceipt"("receiptId");

-- AddForeignKey
ALTER TABLE "EhdmReceipt" ADD CONSTRAINT "EhdmReceipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
