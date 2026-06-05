"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

type SessionCoachLineProps = {
  coachName: string;
  variant: "board" | "list";
  className?: string;
};

export function SessionCoachLine({
  coachName,
  variant,
  className = "",
}: SessionCoachLineProps) {
  const t = useTranslations("common");
  const iconClass = variant === "board" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textClass =
    variant === "board"
      ? "text-sm text-sage-700"
      : "text-xs text-sage-600";

  return (
    <p className={`flex items-center gap-2 ${textClass} ${className}`.trim()}>
      <DashboardNavIcon name="user" className={`${iconClass} shrink-0 text-sand-600`} />
      <span className="min-w-0 truncate">
        <span className="font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("sessionCoach")}
        </span>
        <span className="mx-1.5 text-sage-400" aria-hidden="true">
          ·
        </span>
        <span className="font-medium text-sage-800">{coachName}</span>
      </span>
    </p>
  );
}

export function resolveSessionCoachName(
  coach: { user: { name: string | null } } | null | undefined,
  fallback: string,
): string {
  const trimmed = coach?.user?.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
