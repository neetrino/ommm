"use client";

import type { RefObject } from "react";

type DropdownSelectSearchHeaderProps = {
  value: string;
  placeholder: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function DropdownSelectSearchHeader({
  value,
  placeholder,
  inputRef,
  onChange,
  onKeyDown,
}: DropdownSelectSearchHeaderProps) {
  return (
    <div className="border-b border-[rgba(151,144,124,0.18)] px-3 py-2">
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="ommm-input h-10 w-full"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
