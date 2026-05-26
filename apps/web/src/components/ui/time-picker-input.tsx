"use client";

type TimePickerInputProps = {
  id?: string;
  name: string;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
  step?: number;
};

export function TimePickerInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  ariaLabel,
  step = 60,
}: TimePickerInputProps) {
  return (
    <input
      id={id}
      name={name}
      type="time"
      className="ommm-input"
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      step={step}
    />
  );
}
