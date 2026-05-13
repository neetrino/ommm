"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  containerClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M2.9 12.5C4.5 9.1 7.9 6 12 6s7.5 3.1 9.1 6.5a1.1 1.1 0 0 1 0 1c-1.6 3.4-5 6.5-9.1 6.5s-7.5-3.1-9.1-6.5a1.1 1.1 0 0 1 0-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M2.9 12.5C4.5 9.1 7.9 6 12 6c2.2 0 4.2.9 5.8 2.1M21.1 13.5C19.5 16.9 16.1 20 12 20c-2.2 0-4.2-.9-5.8-2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 4 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function PasswordInput({
  className,
  containerClassName,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const iconLabel = visible ? hidePasswordLabel : showPasswordLabel;

  return (
    <div className={`relative ${containerClassName ?? ""}`}>
      <input {...props} type={visible ? "text" : "password"} className={`${className ?? ""} pr-11`} />
      <button
        type="button"
        aria-label={iconLabel}
        title={iconLabel}
        onClick={() => setVisible((current) => !current)}
        disabled={props.disabled}
        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-sage-500/80 transition-colors hover:text-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/35 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
