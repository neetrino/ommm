"use client";

import type { ReactNode } from "react";
import type { CouponProductKind } from "@/components/admin/admin-coupons-types";

const KINDS: CouponProductKind[] = ["PACKAGE", "DROPIN", "GIFT", "BAR", "OTHER"];

export function FormSection({
  icon,
  title,
  mark,
  required = false,
  children,
}: {
  icon: ReactNode;
  title: string;
  mark: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sage-700">{icon}</span>
        <h3 className="text-sm font-semibold text-sage-900">{title}</h3>
        <span className={required ? "text-base leading-none text-sand-800" : "text-[11px] font-semibold uppercase tracking-wide text-sage-400"}>
          {required ? "*" : mark}
        </span>
      </div>
      {children}
    </section>
  );
}

export function TypeChoice({
  selected,
  sign,
  label,
  onClick,
}: {
  selected: boolean;
  sign: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm ${
        selected
          ? "border-sage-900 bg-sage-900 text-white"
          : "border-sand-200 bg-white text-sage-700"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="font-serif text-base leading-none">{sign}</span>
        <span className="truncate font-medium">{label}</span>
      </span>
      <ChoiceMark selected={selected} />
    </button>
  );
}

function ChoiceMark({ selected }: { selected: boolean }) {
  if (!selected) {
    return <span className="h-4 w-4 shrink-0 rounded-full border border-sand-300 bg-white" />;
  }
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" className="fill-white" />
      <path d="M4.5 8.2 6.7 10.4 11.5 5.6" className="fill-none stroke-sage-900" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TextField({
  label,
  ariaLabel,
  value,
  onChange,
  type = "text",
  uppercase = false,
  required = false,
  placeholder,
}: {
  label?: string;
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  uppercase?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? <span className="ommm-label text-xs uppercase tracking-wide">{label}</span> : null}
      <input
        type={type}
        required={required}
        aria-label={label ?? ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`ommm-input ${uppercase ? "uppercase tracking-wide" : ""}`}
      />
    </label>
  );
}

export function DiscountAmountField({
  ariaLabel,
  value,
  fixed,
  percentLabel,
  amountLabel,
  amountSign,
  onValue,
  onFixed,
}: {
  ariaLabel: string;
  value: string;
  fixed: boolean;
  percentLabel: string;
  amountLabel: string;
  amountSign: string;
  onValue: (value: string) => void;
  onFixed: (fixed: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/70 bg-white/90 py-1 pl-3 pr-1 shadow-sm">
      <input
        inputMode="numeric"
        required
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onValue(event.target.value)}
        className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-sage-900 outline-none"
      />
      <div className="flex shrink-0 rounded-full bg-sand-100 p-0.5" role="group">
        <AmountSwitch
          selected={!fixed}
          label={percentLabel}
          sign="%"
          onClick={() => onFixed(false)}
        />
        <AmountSwitch
          selected={fixed}
          label={amountLabel}
          sign={amountSign}
          onClick={() => onFixed(true)}
        />
      </div>
    </div>
  );
}

function AmountSwitch({
  selected,
  label,
  sign,
  onClick,
}: {
  selected: boolean;
  label: string;
  sign: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 font-serif text-sm leading-none ${
        selected ? "bg-sage-900 text-white" : "text-sage-600"
      }`}
    >
      {sign}
    </button>
  );
}

export function CheckRow({
  checked,
  label,
  offLabel,
  onChange,
}: {
  checked: boolean;
  label: string;
  offLabel: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <TypeChoice selected={checked} sign="∞" label={label} onClick={() => onChange(true)} />
      <TypeChoice selected={!checked} sign="•" label={offLabel} onClick={() => onChange(false)} />
    </div>
  );
}

export function ProductPicker({
  kinds,
  packagePlanId,
  planLabel,
  kindLabel,
  onKinds,
  onPlan,
}: {
  kinds: CouponProductKind[];
  packagePlanId: string;
  planLabel: string;
  kindLabel: (kind: CouponProductKind) => string;
  onKinds: (kinds: CouponProductKind[]) => void;
  onPlan: (value: string) => void;
}) {
  const showPlan = kinds.includes("PACKAGE");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {KINDS.map((kind) => {
          const selected = kinds.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={selected}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                selected ? "bg-sage-900 text-white" : "border border-sand-300 bg-white text-sage-600"
              }`}
              onClick={() => onKinds(selected ? kinds.filter((item) => item !== kind) : [...kinds, kind])}
            >
              {selected ? <ChoiceMark selected /> : null}
              {kindLabel(kind)}
            </button>
          );
        })}
      </div>
      {showPlan ? <TextField label={planLabel} value={packagePlanId} onChange={onPlan} /> : null}
    </div>
  );
}
