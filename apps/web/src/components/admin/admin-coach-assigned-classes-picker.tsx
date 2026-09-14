"use client";

import { coachClassBadgeTone } from "@/components/admin/admin-coach-list-badges";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";

const CHIP_BASE_CLASS =
  "flex w-full min-h-10 min-w-0 items-center justify-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-semibold uppercase tracking-[0.06em] transition-[box-shadow,transform,filter] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-700 disabled:cursor-not-allowed disabled:opacity-50";

function assignedClassChipClass(selected: boolean, index: number): string {
  const tone = coachClassBadgeTone(index);
  if (selected) {
    return `${CHIP_BASE_CLASS} ${tone} shadow-[0_4px_12px_-10px_rgba(45,40,35,0.35)]`;
  }
  return `${CHIP_BASE_CLASS} ${tone} hover:brightness-[0.97] active:scale-[0.98]`;
}

const SELECTED_COUNT_BADGE_CLASS =
  "inline-flex h-5 shrink-0 items-center rounded-full bg-sage-900/8 px-2.5 text-[11px] font-semibold leading-none uppercase tracking-[0.12em] text-sage-800";

/** Selected-count pill for assigned-classes section headers. */
export function AdminCoachAssignedClassesCountBadge({
  count,
  label,
  emptyLabel,
}: {
  count: number;
  label: (count: number) => string;
  emptyLabel: string;
}) {
  if (count > 0) {
    return <span className={SELECTED_COUNT_BADGE_CLASS}>{label(count)}</span>;
  }
  return <p className="shrink-0 text-xs text-sage-500">{emptyLabel}</p>;
}

type AdminCoachAssignedClassesPickerProps = {
  classOptions: readonly CoachClassOption[];
  selectedIds: readonly string[];
  classTypeRates: Readonly<Record<string, string>>;
  onToggle: (classTypeId: string) => void;
  onRateChange: (classTypeId: string, amountAmd: string) => void;
  disabled?: boolean;
  emptyLabel: string;
  /** When false, parent renders {@link AdminCoachAssignedClassesCountBadge} in the section header. */
  showSelectedSummary?: boolean;
  noneSelectedLabel: string;
  selectedCountLabel: (count: number) => string;
  rateLabel: string;
  ratePlaceholder: string;
  ratesHeading: string;
  ratesHint: string;
  error?: string;
  rateError?: string;
};

export function AdminCoachAssignedClassesPicker({
  classOptions,
  selectedIds,
  classTypeRates,
  onToggle,
  onRateChange,
  disabled = false,
  emptyLabel,
  showSelectedSummary = true,
  noneSelectedLabel,
  selectedCountLabel,
  rateLabel,
  ratePlaceholder,
  ratesHeading,
  ratesHint,
  error,
  rateError,
}: AdminCoachAssignedClassesPickerProps) {
  const selectedCount = selectedIds.length;
  const selectedOptions = classOptions.filter((option) =>
    selectedIds.includes(option.id),
  );

  if (classOptions.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed border-sand-500/30 bg-white/45 px-6 py-10 text-center"
        role="status"
      >
        <p className="text-sm text-sage-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSelectedSummary ? (
        <div className="flex items-center justify-end gap-2">
          <AdminCoachAssignedClassesCountBadge
            count={selectedCount}
            label={selectedCountLabel}
            emptyLabel={noneSelectedLabel}
          />
        </div>
      ) : null}

      <div
        className="grid grid-cols-1 gap-2.5 rounded-2xl border border-sand-500/15 bg-gradient-to-b from-white/95 to-sand-50/40 p-4 min-[744px]:grid-cols-2 sm:p-5"
        role="group"
      >
        {classOptions.map((option, index) => {
          const selected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onToggle(option.id)}
              className={assignedClassChipClass(selected, index)}
            >
              {selected ? (
                <DropdownCheckGlyph className="h-3 w-3 shrink-0 stroke-[2.5]" />
              ) : (
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full border border-current"
                  aria-hidden
                />
              )}
              <span className="min-w-0 truncate">{option.name}</span>
            </button>
          );
        })}
      </div>

      {selectedOptions.length > 0 ? (
        <div className="space-y-3 rounded-2xl border border-sand-500/15 bg-white/80 p-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
              {ratesHeading}
            </h4>
            <p className="mt-1 text-xs text-sage-500">{ratesHint}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedOptions.map((option) => (
              <label key={option.id} className="flex flex-col gap-1">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {option.name} — {rateLabel}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="ommm-input"
                  value={classTypeRates[option.id] ?? ""}
                  onChange={(event) => onRateChange(option.id, event.target.value)}
                  placeholder={ratePlaceholder}
                  disabled={disabled}
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-xs text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {rateError ? (
        <p className="text-xs text-red-800" role="alert">
          {rateError}
        </p>
      ) : null}
    </div>
  );
}
