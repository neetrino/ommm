-- Link membership plans to class categories (Admin → Packages).
ALTER TABLE "MembershipPlan" ADD COLUMN "classTypeId" TEXT;

CREATE INDEX "MembershipPlan_classTypeId_idx" ON "MembershipPlan"("classTypeId");

ALTER TABLE "MembershipPlan"
  ADD CONSTRAINT "MembershipPlan_classTypeId_fkey"
  FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
