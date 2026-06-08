"use client";

import { type InputHTMLAttributes } from "react";
import {
  AMD_SYMBOL,
  formatAmdMoneyInputDisplay,
  parseAmdMoneyInput,
} from "@/lib/price-amd";

const AMD_MONEY_INPUT_CLASS =
  "ommm-input pr-9 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

type AmdMoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onValueChange: (rawDigits: string) => void;
  containerClassName?: string;
};

/** Money input with comma grouping and the dram symbol as a trailing suffix. */
export function AmdMoneyInput({
  value,
  onValueChange,
  className,
  containerClassName,
  ...props
}: AmdMoneyInputProps) {
  const displayValue = formatAmdMoneyInputDisplay(value);

  return (
    <div className={`relative ${containerClassName ?? ""}`}>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={(event) => {
          const parsed = parseAmdMoneyInput(event.target.value);
          onValueChange(parsed === null ? "" : String(parsed));
        }}
        className={`${AMD_MONEY_INPUT_CLASS} ${className ?? ""}`}
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-3 z-10 inline-flex items-center text-sm font-semibold text-sage-700"
        aria-hidden
      >
        {AMD_SYMBOL}
      </span>
    </div>
  );
}
