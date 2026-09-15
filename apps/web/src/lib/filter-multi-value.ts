/**
 * Comma-separated multi-select filter values for integrated list filters.
 * Empty string / "all" means no restriction (same as selecting none in the multi UI).
 */

const LIST_SEPARATOR = ",";

export function parseFilterMultiValue(value: string | undefined | null): string[] {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "" || trimmed.toLowerCase() === "all") {
    return [];
  }
  return trimmed
    .split(LIST_SEPARATOR)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part.toLowerCase() !== "all");
}

export function serializeFilterMultiValue(values: readonly string[]): string {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && value.toLowerCase() !== "all")
    .join(LIST_SEPARATOR);
}

/** True when the row value is allowed by a multi filter (empty selection = allow all). */
export function matchesFilterMultiValue(
  selectedCsv: string | undefined | null,
  rowValue: string | null | undefined,
): boolean {
  const selected = parseFilterMultiValue(selectedCsv);
  if (selected.length === 0) {
    return true;
  }
  if (rowValue == null || rowValue === "") {
    return false;
  }
  return selected.includes(rowValue);
}

export function formatFilterMultiChipLabel(
  label: string,
  value: string,
  options?: readonly { value: string; label: string }[],
): string | null {
  const selected = parseFilterMultiValue(value);
  if (selected.length === 0) {
    return null;
  }
  if (selected.length === 1) {
    const only = selected[0]!;
    const optionLabel = options?.find((option) => option.value === only)?.label ?? only;
    return `${label}: ${optionLabel}`;
  }
  return `${label}: ${selected.length} selected`;
}
