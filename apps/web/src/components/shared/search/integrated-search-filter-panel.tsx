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

const DATE_RANGE_PAIR_GRID_CLASS = "grid grid-cols-2 gap-3";

/** +5px vs compact sm buttons (2.5px padding per side). */
const FILTER_PANEL_ACTION_BUTTON_SIZE_CLASS =
  "px-[calc(0.75rem+2.5px)] py-[calc(0.375rem+2.5px)]";

type DateRangePair = {
  from: IntegratedFilterField;
  to: IntegratedFilterField;
};

function splitDateRangePair(
  fields: readonly IntegratedFilterField[],
): { dateRange: DateRangePair | null; rest: IntegratedFilterField[] } {
  const fromIndex = fields.findIndex((field) => field.key === "from" && field.fieldType === "date");
  if (fromIndex === -1) {
    return { dateRange: null, rest: [...fields] };
  }

  const toIndex = fields.findIndex(
    (field, index) => index > fromIndex && field.key === "to" && field.fieldType === "date",
  );
  if (toIndex === -1) {
    return { dateRange: null, rest: [...fields] };
  }

  const from = fields[fromIndex];
  const to = fields[toIndex];
  const rest = fields.filter((_, index) => index !== fromIndex && index !== toIndex);

  return { dateRange: { from, to }, rest };
}

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
  const { dateRange, rest } = splitDateRangePair(visibleFields);

  return (
    <div className="flex flex-col gap-4">
      {dateRange !== null || rest.length > 0 ? (
        <div className="flex flex-col gap-3">
          {dateRange !== null ? (
            <div className={DATE_RANGE_PAIR_GRID_CLASS}>
              <FilterField
                field={dateRange.from}
                value={filterValues[dateRange.from.key] ?? ""}
                onChange={(value) => onFilterChange(dateRange.from.key, value)}
              />
              <FilterField
                field={dateRange.to}
                value={filterValues[dateRange.to.key] ?? ""}
                onChange={(value) => onFilterChange(dateRange.to.key, value)}
              />
            </div>
          ) : null}
          {rest.length > 0 ? (
            <div className={PANEL_GRID_CLASS}>
              {rest.map((field) => (
                <FilterField
                  key={field.key}
                  field={field}
                  value={filterValues[field.key] ?? ""}
                  onChange={(value) => onFilterChange(field.key, value)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center justify-end gap-2.5 border-t border-sage-700/10 pt-3">
        <OmmButton
          type="button"
          size="sm"
          variant="ghost"
          className={FILTER_PANEL_ACTION_BUTTON_SIZE_CLASS}
          onClick={onReset}
        >
          {resetLabel}
        </OmmButton>
        <OmmButton
          type="button"
          size="sm"
          variant="primary"
          className={FILTER_PANEL_ACTION_BUTTON_SIZE_CLASS}
          onClick={onApply}
        >
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
