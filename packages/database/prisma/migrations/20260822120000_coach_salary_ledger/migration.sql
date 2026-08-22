-- Coach per-class rate and monthly salary ledger (accruals + payout history).
ALTER TABLE "CoachProfile" ADD COLUMN "salaryPerClassAmd" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "CoachSalaryAccrual" (
    "id" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "amountAmd" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachSalaryAccrual_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoachSalaryAccrual_classSessionId_key" ON "CoachSalaryAccrual"("classSessionId");
CREATE INDEX "CoachSalaryAccrual_coachProfileId_periodYear_periodMonth_idx" ON "CoachSalaryAccrual"("coachProfileId", "periodYear", "periodMonth");

ALTER TABLE "CoachSalaryAccrual" ADD CONSTRAINT "CoachSalaryAccrual_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoachSalaryAccrual" ADD CONSTRAINT "CoachSalaryAccrual_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CoachSalaryPayout" (
    "id" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "amountAmd" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidByAdminId" TEXT NOT NULL,

    CONSTRAINT "CoachSalaryPayout_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoachSalaryPayout_coachProfileId_periodYear_periodMonth_idx" ON "CoachSalaryPayout"("coachProfileId", "periodYear", "periodMonth");
CREATE INDEX "CoachSalaryPayout_paidByAdminId_idx" ON "CoachSalaryPayout"("paidByAdminId");

ALTER TABLE "CoachSalaryPayout" ADD CONSTRAINT "CoachSalaryPayout_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoachSalaryPayout" ADD CONSTRAINT "CoachSalaryPayout_paidByAdminId_fkey" FOREIGN KEY ("paidByAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
