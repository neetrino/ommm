"use client";

import { useTranslations } from "next-intl";
import {
  clientListPackageBadgeClassName,
  resolveClientListPackageDisplay,
} from "@/components/admin/admin-client-list-package-badge";
import type { ClientRow } from "@/components/admin/admin-clients-types";

type AdminClientPackageBadgeProps = {
  row: Pick<ClientRow, "activePackageId" | "activePackageStatus" | "activePlanName">;
};

export function AdminClientPackageBadge({ row }: AdminClientPackageBadgeProps) {
  const t = useTranslations("adminPages.clients");
  const display = resolveClientListPackageDisplay(row);
  const statusLabel =
    display.tone === "none"
      ? t("packageNoneBadge")
      : display.tone === "active"
        ? t("packageActiveBadge")
        : display.tone === "paused"
          ? t("packagePausedBadge")
          : display.tone === "pending"
            ? t("packagePendingBadge")
            : t("packageExpiredBadge");

  return (
    <div className="flex min-w-0 flex-col items-start gap-1 text-left">
      <span className={clientListPackageBadgeClassName(display.tone)}>{statusLabel}</span>
      {display.planName !== null && display.planName.trim().length > 0 ? (
        <p className="max-w-full truncate text-sm text-sage-600" title={display.planName}>
          {display.planName}
        </p>
      ) : null}
    </div>
  );
}
