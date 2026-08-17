-- CreateEnum
CREATE TYPE "SessionReviewStatus" AS ENUM ('PENDING', 'SUBMITTED', 'DISMISSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SessionReview" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "comment" TEXT,
    "status" "SessionReviewStatus" NOT NULL DEFAULT 'PENDING',
    "promptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "staffReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionReview_bookingId_key" ON "SessionReview"("bookingId");

-- CreateIndex
CREATE INDEX "SessionReview_authorUserId_status_idx" ON "SessionReview"("authorUserId", "status");

-- CreateIndex
CREATE INDEX "SessionReview_status_submittedAt_idx" ON "SessionReview"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "SessionReview_coachProfileId_status_isAnonymous_idx" ON "SessionReview"("coachProfileId", "status", "isAnonymous");

-- CreateIndex
CREATE INDEX "SessionReview_staffReadAt_idx" ON "SessionReview"("staffReadAt");

-- AddForeignKey
ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReview" ADD CONSTRAINT "SessionReview_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
