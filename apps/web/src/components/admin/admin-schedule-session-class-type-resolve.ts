export type SessionClassTypeOption = {
  value: string;
  label: string;
  classTypeId: string;
};

/** Resolves the selected ClassType id from the schedule session dropdown. */
export function resolveSessionClassTypeId(
  selectedValue: string,
  options: readonly SessionClassTypeOption[],
): { classTypeId: string } {
  const option = options.find((item) => item.value === selectedValue);
  if (option !== undefined && option.classTypeId.length > 0) {
    return { classTypeId: option.classTypeId };
  }
  throw new Error("Class type is required.");
}

/** Session title for create flows — derived from the selected class type label. */
export function sessionTitleFromClassTypeSelection(
  selectedValue: string,
  options: readonly SessionClassTypeOption[],
): string {
  const selectedLabel = options.find((item) => item.value === selectedValue)?.label.trim();
  if (selectedLabel) {
    return selectedLabel;
  }
  return "";
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
  const extras = (extraLevels ?? [])
    .map((level) => level.trim())
    .filter((level) => level.length > 0 && !SESSION_LEVEL_VALUES.includes(level as (typeof SESSION_LEVEL_VALUES)[number]))
    .map((level) => ({ value: level, label: level }));
  return [...standardOptions, ...extras];
}
