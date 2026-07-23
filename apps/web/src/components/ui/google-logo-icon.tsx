import type { SVGProps } from "react";

export type GoogleLogoIconProps = SVGProps<SVGSVGElement>;

export function GoogleLogoIcon({ className = "", ...props }: GoogleLogoIconProps) {
  const mergedClassName = ["h-5 w-5 shrink-0", className].filter(Boolean).join(" ");
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={mergedClassName}
      {...props}
    >
      <path
        fill="#EA4335"
        d="M12 10.13v3.97h5.52c-.24 1.28-.96 2.37-2.04 3.1l3.29 2.55c1.92-1.77 3.03-4.38 3.03-7.47 0-.73-.07-1.43-.2-2.11H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.74 0 5.04-.91 6.72-2.47l-3.29-2.55c-.91.61-2.08.97-3.43.97-2.64 0-4.87-1.78-5.67-4.17H2.93v2.63A10.15 10.15 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.33 13.78a6.1 6.1 0 0 1-.32-1.95c0-.68.12-1.34.32-1.95V7.25H2.93A10.15 10.15 0 0 0 1.84 11.83c0 1.64.39 3.2 1.09 4.58l3.4-2.63Z"
      />
      <path
        fill="#4285F4"
        d="M12 5.7c1.49 0 2.83.51 3.88 1.51l2.9-2.9C17.03 2.66 14.73 1.67 12 1.67c-3.98 0-7.41 2.28-9.07 5.58l3.4 2.63C7.13 7.48 9.36 5.7 12 5.7Z"
      />
    </svg>
  );
}
