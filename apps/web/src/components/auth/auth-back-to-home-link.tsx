"use client";

import { useTranslations } from "next-intl";
import { CircularBackLink } from "@/components/ui/circular-back-link";

/**
 * Frosted circular control — auth sign-in header pattern.
 * Wrapper `pt-[19px]` matches shell top rhythm; `-translate-y-2` nudges the control up slightly.
 */
export function AuthBackToHomeLink() {
  const tNav = useTranslations("nav");
  return (
    <div className="-mt-1 mb-4 pt-[19px]">
      <CircularBackLink href="/" ariaLabel={tNav("home")} className="-translate-y-2" />
    </div>
  );
}
