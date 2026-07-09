-- Optional activation date: user packages begin their validity period on this date when set.
ALTER TABLE "PackagePlan" ADD COLUMN "startDate" TIMESTAMP(3);
