import { useMemo } from "react";
import { useTranslations } from "../../i18n/I18nProvider";
import type { PublicPackagePlan } from "./publicPackagePlan";
import {
  formatPackagePlanName,
  formatPackagePricePerSession,
  formatPackageSessionsLabel,
  type PackageDisplayCopy,
} from "./formatPackageDisplay";

const AMD_SYMBOL = "֏";

function formatAmdFromCents(cents: number): string {
  const amount = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(cents));
  return `${amount} ${AMD_SYMBOL}`;
}

export function usePackageDisplayCopy() {
  const tMarketing = useTranslations("marketing");

  return useMemo(() => {
    const copy: PackageDisplayCopy = {
      sessionFallback: tMarketing("packagesTypeSessionsSession"),
      sessionCountLabel: (count: number) =>
        tMarketing("packagesTierSessionsLabel", { count }),
      unlimitedSessions: tMarketing("packagesSessionsUnlimited"),
      sessionsIncluded: tMarketing("packagesTableTotalSessions"),
      perSessionSuffix: tMarketing("packagesTablePricePerSession"),
    };

    return {
      ...copy,
      formatPlanName: (planName: string, sessionsPerMonth: number | null) =>
        formatPackagePlanName(planName, sessionsPerMonth, copy),
      formatSessionsLabel: (plan: PublicPackagePlan) =>
        formatPackageSessionsLabel(plan, copy),
      formatPricePerSession: (plan: PublicPackagePlan) =>
        formatPackagePricePerSession(plan, copy, formatAmdFromCents),
    };
  }, [tMarketing]);
}

export type PackageDisplayFormatters = ReturnType<typeof usePackageDisplayCopy>;
