-- AlterTable
ALTER TABLE "UserPackage" ADD COLUMN "awaitingFirstVisit" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "UserPackage_awaitingFirstVisit_status_idx" ON "UserPackage"("awaitingFirstVisit", "status");
