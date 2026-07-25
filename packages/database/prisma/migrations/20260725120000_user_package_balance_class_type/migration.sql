-- Stable class-type FK for package balance eligibility (name snapshot remains display-only).
ALTER TABLE "UserPackageBalance" ADD COLUMN "classTypeId" TEXT;

ALTER TABLE "UserPackageBalance"
  ADD CONSTRAINT "UserPackageBalance_classTypeId_fkey"
  FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "UserPackageBalance_classTypeId_idx" ON "UserPackageBalance"("classTypeId");
