"use client";

import { type InputHTMLAttributes } from "react";
import {
  AMD_SYMBOL,
  formatAmdMoneyInputDisplay,
  parseAmdMoneyInput,
} from "@/lib/price-amd";

const AMD_MONEY_INPUT_BASE_CLASS =
  "ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const AMD_MONEY_ALIGN_CLASS = {
  start: {
    input: "pl-9 text-left",
    symbol: "left-3",
  },
  end: {
    input: "pr-9 text-right",
    symbol: "right-3",
  },
} as const;

type AmdMoneyAlign = keyof typeof AMD_MONEY_ALIGN_CLASS;

type AmdMoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onValueChange: (rawDigits: string) => void;
  containerClassName?: string;
  align?: AmdMoneyAlign;
};

/** Money input with comma grouping and the dram symbol as a prefix or suffix. */
export function AmdMoneyInput({
  value,
  onValueChange,
  className,
  containerClassName,
  align = "end",
  ...props
}: AmdMoneyInputProps) {
  const displayValue = formatAmdMoneyInputDisplay(value);
  const alignClass = AMD_MONEY_ALIGN_CLASS[align];

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
        className={`${AMD_MONEY_INPUT_BASE_CLASS} ${alignClass.input} ${className ?? ""}`}
      />
      <span
        className={`pointer-events-none absolute inset-y-0 z-10 inline-flex items-center text-sm font-semibold text-sage-700 ${alignClass.symbol}`}
        aria-hidden
      >
        {AMD_SYMBOL}
      </span>
    </div>
  );
}
