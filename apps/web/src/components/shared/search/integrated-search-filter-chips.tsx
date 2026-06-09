"use client";

import type { IntegratedFilterChip } from "@/components/shared/search/integrated-search-filter-types";

type IntegratedSearchFilterChipsProps = {
  chips: readonly IntegratedFilterChip[];
  onActivate?: () => void;
  onRemove?: (key: string) => void;
  /** Inline inside the search bar, or stacked below it. */
  layout?: "inline" | "stacked";
};

const CHIP_CLASS =
  "inline-flex max-w-[12rem] items-center gap-1 rounded-lg bg-white/75 px-2 py-0.5 text-xs font-medium text-sage-800 ring-1 ring-white/70";

const CHIP_STACKED_CLASS =
  "flex w-full max-w-full items-center justify-between gap-2 rounded-xl bg-white/75 px-3 py-2 text-sm font-medium text-sage-800 ring-1 ring-white/70";

export function IntegratedSearchFilterChips({
  chips,
  onActivate,
  onRemove,
  layout = "inline",
}: IntegratedSearchFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  const isStacked = layout === "stacked";

  return (
    <div
      className={
        isStacked
          ? "flex w-full flex-col gap-2"
          : "flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 pe-1"
      }
    >
      {chips.map((chip) => (
        <span key={chip.key} className={isStacked ? CHIP_STACKED_CLASS : CHIP_CLASS}>
          {onActivate ? (
            <button
              type="button"
              className={`truncate text-left transition-colors hover:text-sage-900 ${
                isStacked ? "min-w-0 flex-1" : "max-w-[9rem]"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onActivate();
              }}
            >
              {chip.label}
            </button>
          ) : (
            <span className={isStacked ? "min-w-0 flex-1 truncate" : "max-w-[9rem] truncate"}>
              {chip.label}
            </span>
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
                className={`${isStacked ? "h-3.5 w-3.5" : "h-3 w-3"}`}
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
