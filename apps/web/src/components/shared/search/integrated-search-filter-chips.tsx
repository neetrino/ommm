"use client";

import type { IntegratedFilterChip } from "@/components/shared/search/integrated-search-filter-types";

type IntegratedSearchFilterChipsProps = {
  chips: readonly IntegratedFilterChip[];
  onActivate?: () => void;
};

const CHIP_CLASS =
  "inline-flex max-w-[12rem] items-center rounded-lg bg-white/75 px-2 py-0.5 text-xs font-medium text-sage-800 ring-1 ring-white/70";

export function IntegratedSearchFilterChips({
  chips,
  onActivate,
}: IntegratedSearchFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <>
      {chips.map((chip) =>
        onActivate ? (
          <button
            key={chip.key}
            type="button"
            className={`${CHIP_CLASS} cursor-pointer transition-colors hover:bg-white/90`}
            onClick={(event) => {
              event.stopPropagation();
              onActivate();
            }}
          >
            <span className="truncate">{chip.label}</span>
          </button>
        ) : (
          <span key={chip.key} className={CHIP_CLASS}>
            <span className="truncate">{chip.label}</span>
          </span>
        ),
      )}
    </>
  );
}
