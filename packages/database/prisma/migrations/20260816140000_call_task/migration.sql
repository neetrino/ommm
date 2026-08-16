-- CreateEnum
CREATE TYPE "CallTaskStatus" AS ENUM ('PENDING', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "CallTask" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "dueOn" TIMESTAMP(3) NOT NULL,
    "status" "CallTaskStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "createdById" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallTask_status_dueOn_idx" ON "CallTask"("status", "dueOn");

-- CreateIndex
CREATE INDEX "CallTask_createdById_idx" ON "CallTask"("createdById");

-- CreateIndex
CREATE INDEX "CallTask_userId_idx" ON "CallTask"("userId");

-- AddForeignKey
ALTER TABLE "CallTask" ADD CONSTRAINT "CallTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallTask" ADD CONSTRAINT "CallTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
