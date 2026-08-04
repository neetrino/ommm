"use client";

import { useTranslations } from "next-intl";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import type { ClientSheetPackageTypeBalance } from "@/components/admin/admin-clients-types";

type AdminClientPackageTypeBalancesProps = {
  balances: readonly ClientSheetPackageTypeBalance[];
};

export function AdminClientPackageTypeBalances({
  balances,
}: AdminClientPackageTypeBalancesProps) {
  const t = useTranslations("userPages.packages");
  const tAdmin = useTranslations("adminPages.clients");
  const tMarketing = useTranslations("marketing");

  if (balances.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 border-t border-white/70 pt-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sage-500">
        {tAdmin("packages.sessionTypes")}
      </p>
      <ul className="space-y-2">
        {balances.map((balance) => {
          const used = balance.usedSessions ?? 0;
          const total = balance.totalSessions ?? 0;
          const usageLabel = balance.isUnlimited
            ? tMarketing("packagesSessionsUnlimitedShort")
            : t("sessionsUsedOfTotal", { used, total });
          const remainingLabel =
            !balance.isUnlimited && balance.remainingSessions !== null
              ? t("sessionsRemaining", { count: balance.remainingSessions })
              : null;
          const showUsageBar =
            !balance.isUnlimited && total > 0 && balance.usedSessions !== null;

          return (
            <li key={balance.id} className="space-y-1">
              <div className="flex items-start justify-between gap-2 text-xs">
                <span className="min-w-0 font-medium text-sage-800">
                  {balance.classTypeName}
                </span>
                <span className="shrink-0 text-right text-sage-500">
                  <span className="block text-sage-800">{usageLabel}</span>
                  {remainingLabel !== null ? (
                    <span className="block text-[10px] leading-tight">
                      {remainingLabel}
                    </span>
                  ) : null}
                </span>
              </div>
              {showUsageBar ? (
                <PackageUsageBar
                  used={used}
                  total={total}
                  ariaLabel={usageLabel}
                  size="sm"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
