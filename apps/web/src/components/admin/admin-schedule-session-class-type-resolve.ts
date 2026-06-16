import type { AdminScheduleClassType } from "@/components/admin/admin-schedule-management";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { apiFetch } from "@/lib/api";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";

export type SessionClassTypeOption = {
  value: string;
  label: string;
  classTypeId: string | null;
  packageLabel?: string;
};

export async function resolveSessionClassTypeId(
  selectedValue: string,
  options: readonly SessionClassTypeOption[],
): Promise<{ classTypeId: string; created?: AdminScheduleClassType }> {
  const option = options.find((item) => item.value === selectedValue);
  if (option?.classTypeId !== null && option?.classTypeId !== undefined) {
    return { classTypeId: option.classTypeId };
  }
  const name = option?.packageLabel?.trim() ?? "";
  const existing = options.find(
    (item) => item.classTypeId !== null && item.label.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (existing?.classTypeId !== null && existing?.classTypeId !== undefined) {
    return { classTypeId: existing.classTypeId };
  }
  const packageKey = normalizePackageCategoryKey(name);
  const linkedByCategoryKey = options.find(
    (item) =>
      item.classTypeId !== null &&
      normalizePackageCategoryKey(item.label) === packageKey,
  );
  if (
    linkedByCategoryKey?.classTypeId !== null &&
    linkedByCategoryKey?.classTypeId !== undefined
  ) {
    return { classTypeId: linkedByCategoryKey.classTypeId };
  }
  const slug = buildClassTypeSlugFromName(name);
  if (name.length === 0 || slug.length === 0) {
    throw new Error("Class type is required.");
  }
  const created = await apiFetch<AdminScheduleClassType>("/classes/types", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
  return { classTypeId: created.id, created };
}

/** Session title for create flows — derived from the selected class type label. */
export function sessionTitleFromClassTypeSelection(
  selectedValue: string,
  options: readonly SessionClassTypeOption[],
  resolved: { classTypeId: string; created?: AdminScheduleClassType },
): string {
  const createdName = resolved.created?.name.trim();
  if (createdName) {
    return createdName;
  }

  const selectedLabel = options.find((item) => item.value === selectedValue)?.label.trim();
  if (selectedLabel) {
    return selectedLabel;
  }

  return (
    options.find((item) => item.classTypeId === resolved.classTypeId)?.label.trim() ?? ""
  );
}

export const SESSION_LEVEL_VALUES = ["Beginner", "Intermediate", "Advanced"] as const;

export function buildSessionLevelOptions(
  translate: (
    key: "form.levels.beginner" | "form.levels.intermediate" | "form.levels.advanced",
  ) => string,
  extraLevels?: readonly string[],
): Array<{ value: string; label: string }> {
  const standardOptions = SESSION_LEVEL_VALUES.map((value) => ({
    value,
    label:
      value === "Beginner"
        ? translate("form.levels.beginner")
        : value === "Intermediate"
          ? translate("form.levels.intermediate")
          : translate("form.levels.advanced"),
  }));

  const seen = new Set<string>(SESSION_LEVEL_VALUES);
  const extraOptions: Array<{ value: string; label: string }> = [];

  for (const level of extraLevels ?? []) {
    const trimmed = level.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    extraOptions.push({ value: trimmed, label: trimmed });
  }

  if (extraOptions.length === 0) {
    return standardOptions;
  }

  return [...extraOptions, ...standardOptions];
}
