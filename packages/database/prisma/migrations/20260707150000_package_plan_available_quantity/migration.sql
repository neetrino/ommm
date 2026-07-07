-- Optional inventory cap per package plan. NULL = unlimited (legacy behavior).
ALTER TABLE "PackagePlan" ADD COLUMN "availableQuantity" INTEGER;
