import type { ReactNode } from "react";
import { formatFilterMultiChipLabel, parseFilterMultiValue } from "@/lib/filter-multi-value";

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
  fieldType?: "select" | "multi" | "date" | "custom";
  /**
   * Select behavior for option fields without a custom `render`.
   * Defaults to `"multi"` for All+options filters; sort fields stay `"single"`
   * because their empty value is listed in `options`.
   */
  selectionMode?: "single" | "multi";
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

/** Multi for All+options filters; single when empty value is one of the options (sort). */
export function resolveIntegratedFilterSelectionMode(
  field: IntegratedFilterField,
): "single" | "multi" {
  if (field.selectionMode) {
    return field.selectionMode;
  }
  if (field.fieldType === "multi") {
    return "multi";
  }
  if (field.fieldType === "select") {
    return "single";
  }
  const emptyValue = resolveIntegratedFilterEmptyValue(field);
  const options = field.options ?? [];
  const emptyValueIsListed = options.some((option) => option.value === emptyValue);
  if (emptyValueIsListed) {
    return "single";
  }
  if (options.length > 0 || field.allLabel) {
    return "multi";
  }
  return "single";
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
  if (resolveIntegratedFilterSelectionMode(field) === "multi") {
    return parseFilterMultiValue(value).length > 0;
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
    if (resolveIntegratedFilterSelectionMode(field) === "multi") {
      const multiLabel = formatFilterMultiChipLabel(field.label, value, field.options);
      return multiLabel ? [{ key: field.key, label: multiLabel }] : [];
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
