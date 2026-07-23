import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { AdminScheduleClassType } from "@/components/admin/admin-schedule-management";

export type SchedulePackageOption = {
  id: string;
  label: string;
  classTypeIds: string[];
};

export function buildSchedulePackageFilterOptions(
  packages: readonly AdminPackageRow[],
  classTypes: readonly AdminScheduleClassType[],
): SchedulePackageOption[] {
  const classTypeIdByCategoryKey = new Map(
    classTypes.map((type) => [normalizePackageCategoryKey(type.name), type.id]),
  );
  const byCategorySlug = new Map<string, { label: string; classTypeIds: Set<string> }>();
  const shellLabelByCategorySlug = new Map<string, string>();

  for (const pkg of packages) {
    const categorySlug = pkg.categorySlug;
    const name = pkg.name.trim();
    if (pkg.isActive && pkg.priceCents <= 0 && categorySlug.length > 0 && name.length > 0) {
      shellLabelByCategorySlug.set(categorySlug, name);
    }
  }

  for (const pkg of packages) {
    if (!pkg.isActive) {
      continue;
    }
    const categoryLabel = pkg.categoryName.trim();
    if (categoryLabel.length === 0) {
      continue;
    }
    const categorySlug = pkg.categorySlug;
    const label = shellLabelByCategorySlug.get(categorySlug) ?? categoryLabel;
    const mappedClassTypeId =
      pkg.classTypeId ?? classTypeIdByCategoryKey.get(normalizePackageCategoryKey(categoryLabel));
    const current = byCategorySlug.get(categorySlug);
    if (current === undefined) {
      byCategorySlug.set(categorySlug, {
        label,
        classTypeIds: new Set(mappedClassTypeId === undefined ? [] : [mappedClassTypeId]),
      });
      continue;
    }
    if (mappedClassTypeId !== undefined) {
      current.classTypeIds.add(mappedClassTypeId);
    }
  }

  return [...byCategorySlug.entries()]
    .map(([id, option]) => ({
      id,
      label: option.label,
      classTypeIds: [...option.classTypeIds],
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function resolveScheduleSelectedClassTypeIds(
  selectedPackageIds: readonly string[],
  packageOptions: readonly SchedulePackageOption[],
): string[] {
  if (selectedPackageIds.length === 0) {
    return [];
  }
  const selected = new Set(selectedPackageIds);
  const classTypeIds = new Set<string>();
  for (const option of packageOptions) {
    if (!selected.has(option.id)) {
      continue;
    }
    for (const classTypeId of option.classTypeIds) {
      classTypeIds.add(classTypeId);
    }
  }
  return [...classTypeIds];
}
