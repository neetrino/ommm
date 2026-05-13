"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";

export type ScheduleFilterOption<T extends string> = {
  value: T;
  label: string;
};

type ScheduleFilterDropdownProps<T extends string> = {
  label: string;
  ariaLabel: string;
  value: T;
  options: readonly ScheduleFilterOption<T>[];
  onChange: (value: T) => void;
};

export function ScheduleFilterDropdown<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
}: ScheduleFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
    };
  }, [open]);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <div ref={rootRef} className="relative">
      <p className="sr-only">{ariaLabel}</p>
      <button
        type="button"
        className="w-full min-h-11 rounded-xl border border-white/70 bg-white/80 py-2.5 pl-3 pr-9 text-left text-sm font-medium text-sage-800 shadow-sm outline-none backdrop-blur-sm transition-[border-color,box-shadow] hover:border-white focus-visible:border-sand-500/40 focus-visible:ring-2 focus-visible:ring-sand-500/15"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected?.label ?? label}
      </button>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sage-500">
        <ChevronDownIcon />
      </span>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-1 shadow-[0_24px_50px_-28px_rgba(45,40,35,0.32)] backdrop-blur-xl"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-sand-100/75 font-semibold text-sage-800"
                      : "text-sage-700 hover:bg-white"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  <span
                    aria-hidden
                    className={
                      isSelected
                        ? "h-2 w-2 rounded-full bg-sand-700"
                        : "h-2 w-2 rounded-full bg-transparent"
                    }
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
