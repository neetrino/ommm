"use client";

import type { ReactNode } from "react";
import type { CouponProductKind } from "@/components/admin/admin-coupons-types";

const KINDS: CouponProductKind[] = ["PACKAGE", "DROPIN", "GIFT", "BAR", "OTHER"];

export function FormSection({
  icon,
  title,
  mark,
  required = false,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  mark: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-sand-200/80 bg-sand-50/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sage-800 shadow-sm">{icon}</span>
        <h3 className="font-serif text-xl text-sage-900">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${required ? "bg-peach-100 text-sand-900" : "bg-white text-sage-500"}`}>
          {mark}
        </span>
      </div>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-sage-600">{hint}</p> : null}
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
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
        selected ? "border-sage-800 bg-white shadow-sm" : "border-sand-200 bg-white/60 text-sage-600"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full font-serif text-lg ${selected ? "bg-sage-900 text-white" : "bg-sand-100 text-sage-700"}`}>
        {sign}
      </span>
      <span className="text-sm font-medium text-sage-900">{label}</span>
    </button>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  uppercase = false,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  uppercase?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`ommm-input ${uppercase ? "uppercase tracking-wide" : ""}`}
      />
    </label>
  );
}

export function UnitField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <span className="relative">
        <input
          inputMode="numeric"
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="ommm-input pr-14"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-serif text-sage-700">{unit}</span>
      </span>
    </label>
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
  planHint,
  kindLabel,
  onKinds,
  onPlan,
}: {
  kinds: CouponProductKind[];
  packagePlanId: string;
  planLabel: string;
  planHint: string;
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
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                selected ? "bg-sage-900 text-white" : "border border-sand-200 bg-white text-sage-700"
              }`}
              onClick={() => onKinds(selected ? kinds.filter((item) => item !== kind) : [...kinds, kind])}
            >
              {kindLabel(kind)}
            </button>
          );
        })}
      </div>
      {showPlan ? (
        <div className="flex flex-col gap-1">
          <TextField label={planLabel} value={packagePlanId} onChange={onPlan} />
          <p className="text-xs text-sage-600">{planHint}</p>
        </div>
      ) : null}
    </div>
  );
}
