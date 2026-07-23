"use client";

import { useTranslations } from "next-intl";
import styles from "@/components/admin/admin-schedule-date-strip.module.css";

type AdminScheduleAllClassesButtonProps = {
  selected: boolean;
  sessionCount: number;
  onClick: () => void;
};

function AllClassesGridIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function allClassesSurfaceClass(isActive: boolean): string {
  const interactive =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/25 hover:-translate-y-0.5 motion-safe:transition-[transform,background-color,border-color,box-shadow] motion-safe:duration-200";

  if (isActive) {
    return [
      "border border-sage-700/20 bg-sage-800 text-white",
      "shadow-[0_18px_34px_-24px_rgba(45,40,35,0.6)] ring-2 ring-sage-900/30",
      interactive,
    ].join(" ");
  }

  return [
    "border border-white/70 bg-white/75 text-sage-800",
    "hover:border-sage-800/20 hover:bg-white hover:shadow-[0_12px_28px_-20px_rgba(45,40,35,0.28)]",
    interactive,
  ].join(" ");
}

export function AdminScheduleAllClassesButton({
  selected,
  sessionCount,
  onClick,
}: AdminScheduleAllClassesButtonProps) {
  const t = useTranslations("adminPages.schedule");

  const labelClass = [
    "min-w-0 pr-7 text-[8px] font-bold uppercase leading-[1.2] tracking-[0.08em] whitespace-normal",
    selected ? "text-white/85" : "text-sage-700",
  ].join(" ");

  const countBadgeClass = [
    "absolute right-2 top-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
    selected ? "bg-white/20 text-white" : "bg-sand-50 text-sage-700",
  ].join(" ");

  const iconClass = [
    "h-6 w-6",
    selected ? "text-white/90" : "text-sage-700/80",
  ].join(" ");

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={t("showAllClassesAria", { count: sessionCount })}
      onClick={onClick}
      className={`${styles.allClassesCard} relative flex flex-col rounded-2xl p-3 text-left ${allClassesSurfaceClass(selected)}`}
    >
      <span className={countBadgeClass}>{sessionCount}</span>
      <span className={labelClass}>{t("showAllClasses")}</span>
      <span className="flex min-h-0 flex-1 items-center justify-center">
        <AllClassesGridIcon className={iconClass} />
      </span>
    </button>
  );
}
