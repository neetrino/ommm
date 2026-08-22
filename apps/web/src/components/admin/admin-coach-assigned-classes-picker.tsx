"use client";

import { coachClassBadgeTone } from "@/components/admin/admin-coach-list-badges";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";

const CHIP_BASE_CLASS =
  "inline-flex min-h-10 items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold uppercase tracking-[0.06em] transition-[box-shadow,transform,filter] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-700 disabled:cursor-not-allowed disabled:opacity-50";

function assignedClassChipClass(selected: boolean, index: number): string {
  const tone = coachClassBadgeTone(index);
  if (selected) {
    return `${CHIP_BASE_CLASS} ${tone} shadow-[0_4px_12px_-10px_rgba(45,40,35,0.35)]`;
  }
  return `${CHIP_BASE_CLASS} ${tone} hover:brightness-[0.97] active:scale-[0.98]`;
}

type AdminCoachAssignedClassesPickerProps = {
  classOptions: readonly CoachClassOption[];
  selectedIds: readonly string[];
  onToggle: (classTypeId: string) => void;
  disabled?: boolean;
  emptyLabel: string;
  noneSelectedLabel: string;
  selectedCountLabel: (count: number) => string;
  error?: string;
};

export function AdminCoachAssignedClassesPicker({
  classOptions,
  selectedIds,
  onToggle,
  disabled = false,
  emptyLabel,
  noneSelectedLabel,
  selectedCountLabel,
  error,
}: AdminCoachAssignedClassesPickerProps) {
  const selectedCount = selectedIds.length;

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        {selectedCount > 0 ? (
          <span className="inline-flex rounded-full bg-sage-900/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-800">
            {selectedCountLabel(selectedCount)}
          </span>
        ) : (
          <p className="text-xs text-sage-500">{noneSelectedLabel}</p>
        )}
      </div>

      <div
        className="flex flex-wrap gap-2.5 rounded-2xl border border-sand-500/15 bg-gradient-to-b from-white/95 to-sand-50/40 p-4 sm:p-5"
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
              <span className="whitespace-nowrap">{option.name}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-xs text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
