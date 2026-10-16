"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const COPIED_RESET_MS = 1500;

export function CouponCopyButton({ code }: { code: string }) {
  const t = useTranslations("adminPages.coupons");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
        copied
          ? "bg-emerald-600 text-white"
          : "text-sage-500 hover:bg-sand-100 hover:text-sage-900"
      }`}
      aria-label={copied ? t("copied") : t("copy")}
      title={copied ? t("copied") : t("copy")}
      onClick={(event) => {
        event.stopPropagation();
        void copyCouponCode(code, () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
        });
      }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <CopyGlyph copied={copied} />
    </button>
  );
}

function copyCouponCode(code: string, onCopied: () => void): Promise<void> {
  if (!navigator.clipboard) {
    return Promise.resolve();
  }
  return navigator.clipboard.writeText(code).then(onCopied);
}

function CopyGlyph({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" strokeLinecap="round" />
    </svg>
  );
}
