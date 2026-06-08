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
  const byCategoryKey = new Map<string, { label: string; classTypeIds: Set<string> }>();
  const shellLabelByCategoryKey = new Map<string, string>();

  for (const pkg of packages) {
    const categoryKey = normalizePackageCategoryKey(pkg.categoryName);
    const name = pkg.name.trim();
    if (pkg.isActive && pkg.priceCents <= 0 && categoryKey.length > 0 && name.length > 0) {
      shellLabelByCategoryKey.set(categoryKey, name);
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
    const categoryKey = normalizePackageCategoryKey(categoryLabel);
    const label = shellLabelByCategoryKey.get(categoryKey) ?? categoryLabel;
    const mappedClassTypeId = pkg.classTypeId ?? classTypeIdByCategoryKey.get(categoryKey);
    const current = byCategoryKey.get(categoryKey);
    if (current === undefined) {
      byCategoryKey.set(categoryKey, {
        label,
        classTypeIds: new Set(mappedClassTypeId === undefined ? [] : [mappedClassTypeId]),
      });
      continue;
    }
    if (mappedClassTypeId !== undefined) {
      current.classTypeIds.add(mappedClassTypeId);
    }
  }

  return [...byCategoryKey.entries()]
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
