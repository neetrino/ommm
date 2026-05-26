"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CLASS_STATUS_VALUES, type AdminClassCoachOption, type AdminClassTypeOption } from "@/components/admin/admin-classes-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";

type ClassesFiltersProps = {
  search: string;
  status: string;
  coachId: string;
  typeId: string;
  level: string;
  fromDate: string;
  toDate: string;
  levels: readonly string[];
  coaches: readonly AdminClassCoachOption[];
  classTypes: readonly AdminClassTypeOption[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCoachChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  className?: string;
};

function FilterSelect({ value, onChange, options, className }: SelectProps) {
  return (
    <select className={`ommm-input h-11 w-full py-0 text-sm ${className ?? ""}`} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ClassesFilters({
  search,
  status,
  coachId,
  typeId,
  level,
  fromDate,
  toDate,
  levels,
  coaches,
  classTypes,
  onSearchChange,
  onStatusChange,
  onCoachChange,
  onTypeChange,
  onLevelChange,
  onFromDateChange,
  onToDateChange,
  onReset,
  hasActiveFilters,
}: ClassesFiltersProps) {
  const t = useTranslations("adminPages.classes");
  const fieldLabelClass = "flex min-w-0 flex-col gap-1.5";
  const captionClass = "text-xs font-semibold uppercase tracking-wide text-sage-500";
  const controlClass = "ommm-input h-11 w-full py-0 text-sm";

  const statusOptions = useMemo(
    () => [
      { label: t("filters.allStatuses"), value: "ALL" },
      ...CLASS_STATUS_VALUES.map((value) => ({ label: t(`status.${value}`), value })),
    ],
    [t],
  );

  const coachOptions = useMemo(
    () => [{ label: t("filters.allCoaches"), value: "ALL" }, ...coaches.map((coach) => ({ label: coach.name, value: coach.id }))],
    [coaches, t],
  );

  const typeOptions = useMemo(
    () => [{ label: t("filters.allTypes"), value: "ALL" }, ...classTypes.map((type) => ({ label: type.name, value: type.id }))],
    [classTypes, t],
  );

  const levelOptions = useMemo(
    () => [{ label: t("filters.allLevels"), value: "ALL" }, ...levels.map((item) => ({ label: item, value: item }))],
    [levels, t],
  );

  return (
    <section className="rounded-[24px] border border-white/70 bg-gradient-to-b from-white/80 to-white/60 p-4 shadow-[0_18px_38px_-26px_rgba(45,40,35,0.26)] backdrop-blur-md sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.searchLabel")}</span>
          <input
            type="search"
            value={search}
            className={controlClass}
            placeholder={t("filters.searchPlaceholder")}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.statusLabel")}</span>
          <FilterSelect value={status} onChange={onStatusChange} options={statusOptions} />
        </label>
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.coachLabel")}</span>
          <FilterSelect value={coachId} onChange={onCoachChange} options={coachOptions} />
        </label>
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.typeLabel")}</span>
          <FilterSelect value={typeId} onChange={onTypeChange} options={typeOptions} />
        </label>
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.levelLabel")}</span>
          <FilterSelect value={level} onChange={onLevelChange} options={levelOptions} />
        </label>
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.fromDateLabel")}</span>
          <DatePickerInput
            name="classes-from-date-filter"
            ariaLabel={t("filters.fromDateLabel")}
            placeholder="DD/MM/YYYY"
            value={fromDate}
            onChange={onFromDateChange}
          />
        </label>
        <label className={fieldLabelClass}>
          <span className={captionClass}>{t("filters.toDateLabel")}</span>
          <DatePickerInput
            name="classes-to-date-filter"
            ariaLabel={t("filters.toDateLabel")}
            placeholder="DD/MM/YYYY"
            value={toDate}
            onChange={onToDateChange}
          />
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <div className="w-full sm:w-auto">
          <button
            type="button"
            className="inline-flex h-11 w-full min-w-[11rem] items-center justify-center rounded-full border border-white/75 bg-white/85 px-5 text-sm font-medium text-sage-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!hasActiveFilters}
            onClick={onReset}
          >
            {t("filters.reset")}
          </button>
        </div>
      </div>
    </section>
  );
}
