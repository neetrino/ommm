import type { AdminScheduleClassType } from "@/components/admin/admin-schedule-management";
import { ApiError, apiFetch } from "@/lib/api";

export type SessionClassTypeOption = {
  value: string;
  label: string;
  classTypeId: string | null;
  packageLabel?: string;
};

function buildSlugFromClassTypeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  const slug = buildSlugFromClassTypeName(name);
  if (name.length === 0 || slug.length === 0) {
    throw new Error("Class type is required.");
  }
  const created = await apiFetch<AdminScheduleClassType>("/classes/types", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
  return { classTypeId: created.id, created };
}

export const SESSION_LEVEL_VALUES = ["Beginner", "Intermediate", "Advanced"] as const;

export function buildSessionLevelOptions(
  translate: (
    key: "form.levels.beginner" | "form.levels.intermediate" | "form.levels.advanced",
  ) => string,
  extraLevels?: readonly string[],
): Array<{ value: string; label: string }> {
  const options = SESSION_LEVEL_VALUES.map((value) => ({
    value,
    label:
      value === "Beginner"
        ? translate("form.levels.beginner")
        : value === "Intermediate"
          ? translate("form.levels.intermediate")
          : translate("form.levels.advanced"),
  }));
  const extraOptions = (extraLevels ?? [])
    .map((level) => level.trim())
    .filter(
      (level) =>
        level.length > 0 &&
        !SESSION_LEVEL_VALUES.includes(level as (typeof SESSION_LEVEL_VALUES)[number]),
    )
    .map((level) => ({ value: level, label: level }));
  if (extraOptions.length > 0) {
    return [...extraOptions, ...options];
  }
  return options;
}
