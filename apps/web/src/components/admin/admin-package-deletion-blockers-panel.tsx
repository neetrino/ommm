"use client";

import { useTranslations } from "next-intl";
import type { PackageDeletionBlockerRow } from "@/components/admin/admin-package-deletion-blocker-types";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatDateForUi } from "@/lib/date-display";
import { userDisplayName } from "@/lib/user-display-name";

type AdminPackageDeletionBlockersPanelProps = {
  blockers: readonly PackageDeletionBlockerRow[];
  onMemberClick: (userId: string) => void;
};

const BLOCKER_STATUS_LABEL_KEYS: Partial<
  Record<PackageDeletionBlockerRow["status"], "statusLabels.ACTIVE" | "statusLabels.PAUSED" | "statusLabels.PENDING">
> = {
  ACTIVE: "statusLabels.ACTIVE",
  PAUSED: "statusLabels.PAUSED",
  PENDING: "statusLabels.PENDING",
};

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
}

function memberContactLine(user: PackageDeletionBlockerRow["user"]): string {
  if (user.phone?.trim()) {
    return formatPhoneDisplay(user.phone);
  }
  return user.email.trim();
}

function blockerStatusLabel(
  status: PackageDeletionBlockerRow["status"],
  t: ReturnType<typeof useTranslations<"adminPages.packages.deletionBlockers">>,
): string {
  const key = BLOCKER_STATUS_LABEL_KEYS[status];
  return key ? t(key) : status;
}

export function AdminPackageDeletionBlockersPanel({
  blockers,
  onMemberClick,
}: AdminPackageDeletionBlockersPanelProps) {
  const t = useTranslations("adminPages.packages.deletionBlockers");

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-amber-950">
        {t("listHeading", { count: blockers.length })}
      </p>
      <ul className="max-h-[min(40vh,18rem)] space-y-2 overflow-y-auto pr-1">
        {blockers.map((row) => {
          const displayName = userDisplayName(row.user.name, row.user.lastName, row.user.email);
          const statusLabel = blockerStatusLabel(row.status, t);
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-serif text-sm text-sage-800"
                aria-hidden
              >
                {memberInitials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="truncate text-left text-sm font-medium text-sage-900 underline decoration-sand-300/80 decoration-dotted underline-offset-[4px] hover:text-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
                    onClick={() => onMemberClick(row.user.id)}
                  >
                    {displayName}
                  </button>
                  <span className="rounded-full border border-amber-300/80 bg-white px-2 py-0.5 text-[10px] font-medium text-amber-900">
                    {statusLabel}
                  </span>
                </div>
                <p className="truncate text-xs text-sage-500">{memberContactLine(row.user)}</p>
                <p className="mt-0.5 text-[11px] text-sage-400">
                  {t("validUntil", {
                    date: formatDateForUi(row.currentPeriodEnd),
                  })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-relaxed text-sage-600">{t("resolveHint")}</p>
    </div>
  );
}
