"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { AdminClientsViewMode } from "@/lib/admin-clients-view-preference";

type AdminClientsViewSwitcherProps = {
  value: AdminClientsViewMode;
  onChange: (mode: AdminClientsViewMode) => void;
};

const SWITCHER_TRACK_CLASS =
  "relative inline-flex shrink-0 rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md";

const THUMB_CLASS = [
  "pointer-events-none absolute top-1 left-1 h-9 w-9 rounded-full",
  "bg-[var(--ommm-admin-olive)] shadow-sm",
  "transition-transform duration-300 ease-out motion-reduce:transition-none",
].join(" ");

const SEGMENT_CLASS = [
  "relative z-10 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  "active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_CLASS} text-[var(--ommm-admin-cream)]`
    : `${SEGMENT_CLASS} text-sage-600 hover:text-sage-900`;
}

function ClientsSphereGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function AdminClientsViewSwitcher({
  value,
  onChange,
}: AdminClientsViewSwitcherProps) {
  const t = useTranslations("adminPages.clients");

  return (
    <div role="group" aria-label={t("viewSwitcherAria")} className={SWITCHER_TRACK_CLASS}>
      <span
        aria-hidden
        className={`${THUMB_CLASS} ${value === "sphere" ? "translate-x-full" : "translate-x-0"}`}
      />
      <button
        type="button"
        aria-label={t("viewList")}
        title={t("viewList")}
        aria-pressed={value === "list"}
        className={segmentClassName(value === "list")}
        onClick={() => onChange("list")}
      >
        <DashboardNavIcon name="listOrdered" className="h-4 w-4 shrink-0" />
      </button>
      <button
        type="button"
        aria-label={t("viewSphere")}
        title={t("viewSphere")}
        aria-pressed={value === "sphere"}
        className={segmentClassName(value === "sphere")}
        onClick={() => onChange("sphere")}
      >
        <ClientsSphereGlyph className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}
