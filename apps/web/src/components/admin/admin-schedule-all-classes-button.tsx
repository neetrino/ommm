"use client";

import { useTranslations } from "next-intl";
import styles from "@/components/admin/admin-schedule-date-strip.module.css";

type AdminScheduleAllClassesCardProps = {
  sessionCount: number;
  isSelected: boolean;
  onSelect: () => void;
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

const ALL_CLASSES_SELECTED_SURFACE = [
  "border border-sage-700/20 bg-sage-800 text-white",
  "shadow-[0_18px_34px_-24px_rgba(45,40,35,0.6)] ring-2 ring-sage-900/30",
].join(" ");

const ALL_CLASSES_IDLE_SURFACE =
  "border border-white/70 bg-white/75 text-sage-800 hover:bg-sand-50";

/** Filter control: show every session (clears the date-strip day selection). */
export function AdminScheduleAllClassesCard({
  sessionCount,
  isSelected,
  onSelect,
}: AdminScheduleAllClassesCardProps) {
  const t = useTranslations("adminPages.schedule");
  const surfaceClass = isSelected ? ALL_CLASSES_SELECTED_SURFACE : ALL_CLASSES_IDLE_SURFACE;
  const badgeClass = isSelected
    ? "bg-white/20 text-white"
    : "bg-sand-50 text-sage-700";
  const labelClass = isSelected ? "text-white/85" : "text-sage-700";
  const iconClass = isSelected ? "text-white/90" : "text-sage-800";

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={t("showAllClassesAria", { count: sessionCount })}
      onClick={onSelect}
      className={`${styles.allClassesCard} relative flex flex-col rounded-2xl p-3 text-left transition-colors ${surfaceClass}`}
    >
      <span
        className={`absolute right-2 top-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}
      >
        {sessionCount}
      </span>
      <span
        className={`min-w-0 pr-7 text-[8px] font-bold uppercase leading-[1.2] tracking-[0.08em] whitespace-normal ${labelClass}`}
      >
        {t("showAllClasses")}
      </span>
      <span className="flex min-h-0 flex-1 items-center justify-center">
        <AllClassesGridIcon className={`h-6 w-6 ${iconClass}`} />
      </span>
    </button>
  );
}
