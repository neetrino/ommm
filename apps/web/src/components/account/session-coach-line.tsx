"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

type SessionCoachLineProps = {
  coachName: string | null;
  variant: "board" | "list";
  className?: string;
};

type CoachNameSource = {
  user: { name: string | null; lastName?: string | null };
};

export function SessionCoachLine({
  coachName,
  variant,
  className = "",
}: SessionCoachLineProps) {
  const t = useTranslations("common");
  const isBoard = variant === "board";
  const iconClass = isBoard ? "h-4 w-4" : "h-3.5 w-3.5";
  const typeClass = isBoard ? "text-sm" : "text-xs";
  const labelClass = `${typeClass} font-medium text-sage-500`;

  return (
    <p
      className={`flex min-w-0 gap-2 ${isBoard ? "items-start" : "items-center"} ${className}`.trim()}
    >
      <DashboardNavIcon
        name="user"
        className={`${iconClass} ${isBoard ? "mt-0.5" : ""} shrink-0 text-sand-600`}
      />
      {isBoard ? (
        <span className={`${typeClass} min-w-0 leading-snug break-words`}>
          <span className={labelClass}>{t("sessionCoach")}</span>
          {coachName ? (
            <>
              <span className="text-sage-400" aria-hidden="true">
                {" "}
                ·{" "}
              </span>
              <span className="font-semibold text-sage-800">{coachName}</span>
            </>
          ) : null}
        </span>
      ) : (
        <>
          <span className={`shrink-0 ${labelClass}`}>{t("sessionCoach")}</span>
          {coachName ? (
            <>
              <span className="shrink-0 text-sage-400" aria-hidden="true">
                ·
              </span>
              <span className={`min-w-0 truncate ${typeClass} font-semibold text-sage-800`}>
                {coachName}
              </span>
            </>
          ) : null}
        </>
      )}
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
