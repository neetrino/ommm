"use client";

import type { IntegratedFilterChip } from "@/components/shared/search/integrated-search-filter-types";

type IntegratedSearchFilterChipsProps = {
  chips: readonly IntegratedFilterChip[];
  onActivate?: () => void;
  onRemove?: (key: string) => void;
};

const CHIP_CLASS =
  "inline-flex max-w-[12rem] items-center gap-1 rounded-lg bg-white/75 px-2 py-0.5 text-xs font-medium text-sage-800 ring-1 ring-white/70";

export function IntegratedSearchFilterChips({
  chips,
  onActivate,
  onRemove,
}: IntegratedSearchFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 pe-1">
      {chips.map((chip) => (
        <span key={chip.key} className={CHIP_CLASS}>
          {onActivate ? (
            <button
              type="button"
              className="max-w-[9rem] truncate text-left transition-colors hover:text-sage-900"
              onClick={(event) => {
                event.stopPropagation();
                onActivate();
              }}
            >
              {chip.label}
            </button>
          ) : (
            <span className="max-w-[9rem] truncate">{chip.label}</span>
          )}
          {onRemove ? (
            <button
              type="button"
              className="inline-flex shrink-0 rounded p-0.5 text-sage-600 transition-colors hover:bg-white/60 hover:text-sage-900"
              aria-label={`Remove ${chip.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(chip.key);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3 w-3"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}
