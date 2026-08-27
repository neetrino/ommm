"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

type SessionCoachLineProps = {
  coachName: string | null;
  variant: "board" | "list";
  /** Hide the "Coach" prefix when the role is already obvious. */
  hideRoleLabel?: boolean;
  className?: string;
};

type CoachNameSource = {
  user: { name: string | null; lastName?: string | null };
};

function CoachRoleAndName({
  coachName,
  hideRoleLabel,
  isBoard,
  roleLabel,
}: {
  coachName: string | null;
  hideRoleLabel: boolean;
  isBoard: boolean;
  roleLabel: string;
}) {
  const typeClass = isBoard ? "text-sm" : "text-xs";
  const labelClass = `${typeClass} font-medium text-sage-500`;
  const nameClass = `${typeClass} font-semibold text-sage-800`;

  if (hideRoleLabel) {
    if (!coachName) return null;
    return (
      <span
        className={`min-w-0 ${isBoard ? "line-clamp-2 leading-snug break-words" : "truncate"} ${nameClass}`}
      >
        {coachName}
      </span>
    );
  }

  const name = coachName ? (
    <>
      <span className={`${isBoard ? "" : "shrink-0 "}text-sage-400`} aria-hidden="true">
        {isBoard ? " · " : "·"}
      </span>
      <span className={`${isBoard ? "" : "min-w-0 truncate "}${nameClass}`}>{coachName}</span>
    </>
  ) : null;

  if (isBoard) {
    return (
      <span className={`${typeClass} line-clamp-2 min-w-0 leading-snug break-words`}>
        <span className={labelClass}>{roleLabel}</span>
        {name}
      </span>
    );
  }

  return (
    <>
      <span className={`shrink-0 ${labelClass}`}>{roleLabel}</span>
      {name}
    </>
  );
}

export function SessionCoachLine({
  coachName,
  variant,
  hideRoleLabel = false,
  className = "",
}: SessionCoachLineProps) {
  const t = useTranslations("common");
  const isBoard = variant === "board";
  const iconClass = isBoard ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <p
      className={`flex min-w-0 gap-1.5 ${isBoard ? "items-start" : "items-center"} ${className}`.trim()}
    >
      <DashboardNavIcon
        name="user"
        className={`${iconClass} ${isBoard ? "mt-0.5" : ""} shrink-0 text-sand-600`}
      />
      <CoachRoleAndName
        coachName={coachName}
        hideRoleLabel={hideRoleLabel}
        isBoard={isBoard}
        roleLabel={t("sessionCoach")}
      />
    </p>
  );
}

export function resolveSessionCoachName(
  coach: CoachNameSource | null | undefined,
): string | null {
  const full = [coach?.user.name, coach?.user.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");
  return full.length > 0 ? full : null;
}
