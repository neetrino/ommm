-- Per-coach salary rates by class type (replaces flat CoachProfile.salaryPerClassAmd for accrual).
CREATE TABLE "CoachClassTypeRate" (
    "id" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "classTypeId" TEXT NOT NULL,
    "amountAmd" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachClassTypeRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoachClassTypeRate_coachProfileId_classTypeId_key" ON "CoachClassTypeRate"("coachProfileId", "classTypeId");
CREATE INDEX "CoachClassTypeRate_classTypeId_idx" ON "CoachClassTypeRate"("classTypeId");

ALTER TABLE "CoachClassTypeRate" ADD CONSTRAINT "CoachClassTypeRate_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoachClassTypeRate" ADD CONSTRAINT "CoachClassTypeRate_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
