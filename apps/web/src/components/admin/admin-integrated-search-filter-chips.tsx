"use client";

import type { AdminIntegratedFilterChip } from "@/components/admin/admin-integrated-search-filter-types";

type AdminIntegratedSearchFilterChipsProps = {
  chips: readonly AdminIntegratedFilterChip[];
  onRemove: (key: string) => void;
};

export function AdminIntegratedSearchFilterChips({
  chips,
  onRemove,
}: AdminIntegratedSearchFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5 pe-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex max-w-[12rem] items-center gap-1 rounded-lg bg-sand-100/90 px-2 py-0.5 text-xs font-medium text-sage-800"
        >
          <span className="truncate">{chip.label}</span>
          <button
            type="button"
            className="rounded p-0.5 transition-colors hover:bg-sand-200/80"
            aria-label={`Remove filter ${chip.label}`}
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
        </span>
      ))}
    </div>
  );
}
