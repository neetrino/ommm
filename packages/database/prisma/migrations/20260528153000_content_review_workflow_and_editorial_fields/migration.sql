-- Add approval lifecycle statuses for content workflow.
ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- Add richer editorial metadata and review audit fields.
ALTER TABLE "ContentPost"
ADD COLUMN "authorName" TEXT,
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "seoTitle" TEXT,
ADD COLUMN "seoDescription" TEXT,
ADD COLUMN "editorialNotes" TEXT,
ADD COLUMN "reviewNotes" TEXT,
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "submittedForReviewAt" TIMESTAMP(3);

CREATE INDEX "ContentPost_status_submittedForReviewAt_idx"
ON "ContentPost" ("status", "submittedForReviewAt");
