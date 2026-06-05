"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

type SessionCoachLineProps = {
  coachName: string | null;
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
  const labelClass =
    variant === "board"
      ? "text-sm font-medium text-sage-500"
      : "text-xs font-medium text-sage-500";
  const nameClass =
    variant === "board"
      ? "min-w-0 truncate text-sm font-semibold text-sage-800"
      : "min-w-0 truncate text-xs font-semibold text-sage-800";

  return (
    <p className={`flex min-w-0 items-center gap-2 ${className}`.trim()}>
      <DashboardNavIcon name="user" className={`${iconClass} shrink-0 text-sand-600`} />
      <span className={`shrink-0 ${labelClass}`}>{t("sessionCoach")}</span>
      {coachName ? (
        <>
          <span className="shrink-0 text-sage-400" aria-hidden="true">
            ·
          </span>
          <span className={nameClass}>{coachName}</span>
        </>
      ) : null}
    </p>
  );
}

export function resolveSessionCoachName(
  coach: { user: { name: string | null } } | null | undefined,
): string | null {
  const trimmed = coach?.user?.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
