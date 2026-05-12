"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function BackToHomeChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

/**
 * Frosted circular control — matches auth register / Figma sign-in header.
 * Wrapper `pt-[19px]` matches shell top rhythm; `translate-y-[38px]` shifts only the control further down.
 */
export function AuthBackToHomeLink() {
  const tNav = useTranslations("nav");
  return (
    <div className="-mt-1 mb-4 pt-[19px]">
      <Link
        href="/"
        className="inline-flex h-10 w-10 translate-y-[38px] items-center justify-center rounded-full border border-white/70 bg-white/75 text-sage-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        aria-label={tNav("home")}
      >
        <BackToHomeChevronIcon />
      </Link>
    </div>
  );
}
