"use client";

import { createPortal } from "react-dom";
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
  name?: string;
  disabled?: boolean;
  required?: boolean;
};

export function ScheduleFilterDropdown<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  name,
  disabled = false,
  required = false,
}: ScheduleFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listboxId = useId();
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    placement: "top" | "bottom";
  } | null>(null);

  useEffect(() => {
    if (!open || disabled) return;
    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) return;
      const clickedTrigger = rootRef.current?.contains(event.target) ?? false;
      const clickedList = listRef.current?.contains(event.target) ?? false;
      if (!clickedTrigger && !clickedList) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
    };
  }, [open, disabled]);

  useEffect(() => {
    if (!open || disabled) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (trigger === null) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const spacing = 8;
      const minMenuHeight = 140;
      const availableBelow = window.innerHeight - rect.bottom - spacing;
      const availableAbove = rect.top - spacing;
      const shouldOpenAbove = availableBelow < minMenuHeight && availableAbove > availableBelow;
      const maxHeight = Math.max(120, shouldOpenAbove ? availableAbove : availableBelow);
      const top = shouldOpenAbove ? rect.top - spacing : rect.bottom + spacing;

      setMenuPosition({
        top,
        left: rect.left,
        width: rect.width,
        maxHeight,
        placement: shouldOpenAbove ? "top" : "bottom",
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, disabled]);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const isMenuOpen = open && !disabled;

  return (
    <div ref={rootRef} className="relative">
      <p className="sr-only">{ariaLabel}</p>
      <button
        ref={triggerRef}
        type="button"
        className="w-full min-h-11 rounded-xl border border-white/70 bg-white/80 py-2.5 pl-3 pr-9 text-left text-sm font-medium text-sage-800 shadow-sm outline-none backdrop-blur-sm transition-[border-color,box-shadow] hover:border-white focus-visible:border-sand-500/40 focus-visible:ring-2 focus-visible:ring-sand-500/15 disabled:pointer-events-none disabled:opacity-60"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected?.label ?? label}
      </button>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sage-500">
        <ChevronDownIcon />
      </span>

      {isMenuOpen && menuPosition !== null && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              className="fixed z-[2000] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/70 bg-white/95 p-1 shadow-[0_24px_50px_-28px_rgba(45,40,35,0.32)] backdrop-blur-xl"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
                transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
              }}
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
                      disabled={disabled}
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
            </ul>,
            document.body,
          )
        : null}
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
    </div>
  );
}
