-- Soft-delete class types: hide from catalog, keep id for existing sessions and package balances.
ALTER TABLE "ClassType" ADD COLUMN "archivedAt" TIMESTAMP(3);
