"use client";

import { AmdMoneyInput } from "@/components/ui/amd-money-input";

const BAR_FIELD_CLASS = "!h-12 !rounded-2xl bg-white px-4 text-sm";
const BAR_LABEL_CLASS = "text-xs font-medium uppercase tracking-[0.06em] text-sage-500";

export function BarNameField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className={BAR_LABEL_CLASS}>{props.label}</span>
      <input
        className={`ommm-input ${BAR_FIELD_CLASS}`}
        value={props.value}
        placeholder={props.label}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  );
}

export function BarPriceField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5 sm:w-40">
      <span className={BAR_LABEL_CLASS}>{props.label}</span>
      <AmdMoneyInput
        value={props.value}
        align="start"
        placeholder={props.label}
        aria-label={props.label}
        className={BAR_FIELD_CLASS}
        onValueChange={props.onChange}
      />
    </label>
  );
}
