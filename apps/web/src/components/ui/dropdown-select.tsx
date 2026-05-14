"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "top" | "bottom";
};

export type DropdownSelectProps<T extends string> = {
  label: string;
  ariaLabel: string;
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  renderValue?: (option: DropdownOption<T> | undefined) => ReactNode;
  renderOption?: (option: DropdownOption<T>, selected: boolean) => ReactNode;
};

const DEFAULT_TRIGGER_CLASS =
  "w-full min-h-11 rounded-xl border border-white/70 bg-white/80 py-2.5 pl-3 pr-9 text-left text-sm font-medium text-sage-800 shadow-sm outline-none backdrop-blur-sm transition-[border-color,box-shadow] hover:border-white focus-visible:border-sand-500/40 focus-visible:ring-2 focus-visible:ring-sand-500/15 disabled:pointer-events-none disabled:opacity-60";

const DEFAULT_MENU_CLASS =
  "fixed z-[2000] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/70 bg-white/95 p-1 shadow-[0_24px_50px_-28px_rgba(45,40,35,0.32)] backdrop-blur-xl";

const DEFAULT_OPTION_CLASS =
  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/20";

function mergeClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function isCharacterNavigationKey(event: React.KeyboardEvent<HTMLButtonElement>): boolean {
  return event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ";
}

export function DropdownSelect<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  name,
  disabled = false,
  required = false,
  className,
  triggerClassName,
  menuClassName,
  renderValue,
  renderOption,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((option) => option.value === value)),
    [options, value],
  );
  const isMenuOpen = open && !disabled && options.length > 0;

  useEffect(() => {
    if (!open || disabled) return;
    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) return;
      const clickedTrigger = rootRef.current?.contains(event.target) ?? false;
      const clickedList = listRef.current?.contains(event.target) ?? false;
      if (!clickedTrigger && !clickedList) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
    };
  }, [open, disabled]);

  useEffect(() => {
    if (!open || disabled) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (trigger === null) return;
      const rect = trigger.getBoundingClientRect();
      const spacing = 8;
      const minMenuHeight = 140;
      const availableBelow = window.innerHeight - rect.bottom - spacing;
      const availableAbove = rect.top - spacing;
      const openAbove = availableBelow < minMenuHeight && availableAbove > availableBelow;
      setMenuPosition({
        top: openAbove ? rect.top - spacing : rect.bottom + spacing,
        left: Math.min(rect.left, Math.max(8, window.innerWidth - rect.width - 8)),
        width: Math.min(rect.width, window.innerWidth - 16),
        maxHeight: Math.max(120, openAbove ? availableAbove : availableBelow),
        placement: openAbove ? "top" : "bottom",
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

  useEffect(() => {
    if (!isMenuOpen) return;
    optionRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, isMenuOpen]);

  function closeAndFocusTrigger() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function selectValue(next: T) {
    onChange(next);
    closeAndFocusTrigger();
  }

  function openMenu(initialIndex: number) {
    if (disabled || options.length === 0) return;
    setFocusedIndex(initialIndex);
    setOpen(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isCharacterNavigationKey(event)) return;
    event.preventDefault();
    const startIndex = event.key === "ArrowUp" ? options.length - 1 : selectedIndex;
    openMenu(startIndex);
  }

  function onOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    option: DropdownOption<T>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((index + 1) % options.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((index - 1 + options.length) % options.length);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectValue(option.value);
    }
  }

  return (
    <div ref={rootRef} className={mergeClasses("relative", className)}>
      <p className="sr-only">{ariaLabel}</p>
      <button
        ref={triggerRef}
        type="button"
        className={mergeClasses(DEFAULT_TRIGGER_CLASS, triggerClassName)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled || options.length === 0}
        onClick={() => (isMenuOpen ? closeAndFocusTrigger() : openMenu(selectedIndex))}
        onKeyDown={onTriggerKeyDown}
      >
        {renderValue ? renderValue(selected) : (selected?.label ?? label)}
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
              className={mergeClasses(DEFAULT_MENU_CLASS, menuClassName)}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
                transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="presentation">
                    <button
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      type="button"
                      role="option"
                      tabIndex={index === focusedIndex ? 0 : -1}
                      aria-selected={isSelected}
                      className={mergeClasses(
                        DEFAULT_OPTION_CLASS,
                        isSelected
                          ? "bg-sand-100/75 font-semibold text-sage-800"
                          : "text-sage-700 hover:bg-white",
                      )}
                      onClick={() => selectValue(option.value)}
                      onKeyDown={(event) => onOptionKeyDown(event, index, option)}
                    >
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <>
                          <span>{option.label}</span>
                          <span
                            aria-hidden
                            className={
                              isSelected
                                ? "h-2 w-2 rounded-full bg-sand-700"
                                : "h-2 w-2 rounded-full bg-transparent"
                            }
                          />
                        </>
                      )}
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
