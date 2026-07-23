import type { ReactNode } from "react";

export type IntegratedFilterOption = {
  value: string;
  label: string;
};

export type IntegratedFilterField = {
  key: string;
  label: string;
  /** Value treated as inactive — hidden from chips. Defaults to "" then "all". */
  emptyValue?: string;
  options?: readonly IntegratedFilterOption[];
  allLabel?: string;
  fieldType?: "select" | "date" | "custom";
  /** When true, chip is shown even when value equals {@link emptyValue}. */
  alwaysShowChip?: boolean;
  resolveChipLabel?: (value: string) => string | null;
  render?: (args: { value: string; onChange: (next: string) => void }) => ReactNode;
};

export type IntegratedFilterChip = {
  key: string;
  label: string;
};

export function resolveIntegratedFilterEmptyValue(field: IntegratedFilterField): string {
  return field.emptyValue ?? "";
}

export function resolveIntegratedFilterActiveValue(
  field: IntegratedFilterField,
  filterValues: Record<string, string>,
): string {
  return filterValues[field.key]?.trim() ?? "";
}

export function isIntegratedFilterActive(
  field: IntegratedFilterField,
  filterValues: Record<string, string>,
): boolean {
  const value = resolveIntegratedFilterActiveValue(field, filterValues);
  const empty = resolveIntegratedFilterEmptyValue(field);
  if (value === empty) {
    return false;
  }
  if (empty === "" && value === "all") {
    return false;
  }
  return value.length > 0;
}

export function buildIntegratedFilterChips(
  fields: readonly IntegratedFilterField[] | undefined,
  filterValues: Record<string, string>,
): IntegratedFilterChip[] {
  if (!fields?.length) {
    return [];
  }

  return fields.flatMap((field) => {
    const showChip =
      field.alwaysShowChip === true || isIntegratedFilterActive(field, filterValues);
    if (!showChip) {
      return [];
    }
    const value = resolveIntegratedFilterActiveValue(field, filterValues);
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

export function clearIntegratedFilterValues(
  fields: readonly IntegratedFilterField[] | undefined,
): Record<string, string> {
  const cleared: Record<string, string> = {};
  fields?.forEach((field) => {
    cleared[field.key] = resolveIntegratedFilterEmptyValue(field);
  });
  return cleared;
}

/** Omit select fields with no options — only "All" would remain. */
export function shouldRenderIntegratedFilterField(field: IntegratedFilterField): boolean {
  if (field.fieldType === "date" || field.fieldType === "custom" || field.render) {
    return true;
  }
  return (field.options?.length ?? 0) > 0;
}
