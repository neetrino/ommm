import type { ReactNode } from "react";

export type AdminIntegratedFilterOption = {
  value: string;
  label: string;
};

export type AdminIntegratedFilterField = {
  key: string;
  label: string;
  /** Value treated as inactive — hidden from chips. Defaults to "" then "all". */
  emptyValue?: string;
  options?: readonly AdminIntegratedFilterOption[];
  allLabel?: string;
  fieldType?: "select" | "date" | "custom";
  /** When true, chip is shown even when value equals {@link emptyValue}. */
  alwaysShowChip?: boolean;
  resolveChipLabel?: (value: string) => string | null;
  render?: (args: { value: string; onChange: (next: string) => void }) => ReactNode;
};

export type AdminIntegratedFilterChip = {
  key: string;
  label: string;
};

export function resolveAdminIntegratedFilterEmptyValue(
  field: AdminIntegratedFilterField,
): string {
  return field.emptyValue ?? "";
}

export function resolveAdminIntegratedFilterActiveValue(
  field: AdminIntegratedFilterField,
  filterValues: Record<string, string>,
): string {
  return filterValues[field.key]?.trim() ?? "";
}

export function isAdminIntegratedFilterActive(
  field: AdminIntegratedFilterField,
  filterValues: Record<string, string>,
): boolean {
  const value = resolveAdminIntegratedFilterActiveValue(field, filterValues);
  const empty = resolveAdminIntegratedFilterEmptyValue(field);
  if (value === empty) {
    return false;
  }
  if (empty === "" && value === "all") {
    return false;
  }
  return value.length > 0;
}

export function buildAdminIntegratedFilterChips(
  fields: readonly AdminIntegratedFilterField[] | undefined,
  filterValues: Record<string, string>,
): AdminIntegratedFilterChip[] {
  if (!fields?.length) {
    return [];
  }

  return fields.flatMap((field) => {
    const showChip =
      field.alwaysShowChip === true ||
      isAdminIntegratedFilterActive(field, filterValues);
    if (!showChip) {
      return [];
    }
    const value = resolveAdminIntegratedFilterActiveValue(field, filterValues);
    const customLabel = field.resolveChipLabel?.(value);
    if (customLabel === null) {
      return [];
    }
    if (customLabel) {
      return [{ key: field.key, label: customLabel }];
    }
    const option = field.options?.find((item) => item.value === value);
    const valueLabel = option?.label ?? value;
    return [{ key: field.key, label: `${field.label}: ${valueLabel}` }];
  });
}

export function clearAdminIntegratedFilterValues(
  fields: readonly AdminIntegratedFilterField[] | undefined,
): Record<string, string> {
  const cleared: Record<string, string> = {};
  fields?.forEach((field) => {
    cleared[field.key] = resolveAdminIntegratedFilterEmptyValue(field);
  });
  return cleared;
}
