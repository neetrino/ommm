"use client";

type AdminClientBookingGuestFieldProps = {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function AdminClientBookingGuestField({
  label,
  hint,
  placeholder,
  value,
  disabled,
  onChange,
}: AdminClientBookingGuestFieldProps) {
  return (
    <label className="mt-3 block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500">
        {label}
      </span>
      <input
        type="text"
        name="guestName"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-sand-200/80 bg-white px-3.5 py-2.5 text-sm text-sage-900"
      />
      <span className="mt-1 block text-xs text-sage-500">{hint}</span>
    </label>
  );
}
