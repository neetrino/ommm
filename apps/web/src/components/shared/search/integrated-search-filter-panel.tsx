"use client";

import type { ReactNode } from "react";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFilterDropdown, OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import {
  shouldRenderIntegratedFilterField,
  type IntegratedFilterField,
} from "@/components/shared/search/integrated-search-filter-types";

const PANEL_GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2";

type IntegratedSearchFilterPanelProps = {
  fields: readonly IntegratedFilterField[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  applyLabel: string;
  resetLabel: string;
};

export function IntegratedSearchFilterPanel({
  fields,
  filterValues,
  onFilterChange,
  onApply,
  onReset,
  applyLabel,
  resetLabel,
}: IntegratedSearchFilterPanelProps) {
  const visibleFields = fields.filter(shouldRenderIntegratedFilterField);

  return (
    <div className="flex flex-col gap-4">
      {visibleFields.length > 0 ? (
        <div className={PANEL_GRID_CLASS}>
          {visibleFields.map((field) => (
            <FilterField
              key={field.key}
              field={field}
              value={filterValues[field.key] ?? ""}
              onChange={(value) => onFilterChange(field.key, value)}
            />
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-end gap-2 border-t border-sage-700/10 pt-3">
        <OmmButton type="button" size="sm" variant="ghost" onClick={onReset}>
          {resetLabel}
        </OmmButton>
        <OmmButton type="button" size="sm" variant="primary" onClick={onApply}>
          {applyLabel}
        </OmmButton>
      </div>
    </div>
  );
}

function FilterField({
  field,
  value,
  onChange,
}: {
  field: IntegratedFilterField;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs text-sage-700">
      <span>{field.label}</span>
      {renderFieldControl(field, value, onChange)}
    </label>
  );
}

function renderFieldControl(
  field: IntegratedFilterField,
  value: string,
  onChange: (next: string) => void,
): ReactNode {
  if (field.render) {
    return field.render({ value, onChange });
  }

  if (field.fieldType === "date") {
    return (
      <DatePickerInput
        name={field.key}
        value={value}
        onChange={onChange}
        placeholder={field.label}
      />
    );
  }

  const emptyValue = field.emptyValue ?? "";
  const options = field.options ?? [];
  const emptyValueIsListed = options.some((option) => option.value === emptyValue);

  if (emptyValueIsListed) {
    return (
      <OmmSelectDropdown
        ariaLabel={field.label}
        label={field.label}
        value={value.length > 0 ? value : emptyValue}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onChange={onChange}
      />
    );
  }

  return (
    <OmmFilterDropdown
      allValue={emptyValue}
      value={value}
      ariaLabel={field.label}
      allLabel={field.allLabel ?? `All ${field.label.toLowerCase()}`}
      onChange={onChange}
      options={options.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
    />
  );
}
