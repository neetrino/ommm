import { useMemo } from "react";
import { formatMembershipValidityRemaining } from "../../i18n/formatMessage";
import { useLocale, useTranslations } from "../../i18n/I18nProvider";
import {
  computeRemainingValidityDays,
  type UserMembershipRow,
  type UserPackageStatus,
} from "./userMembership";

function formatActivationDeadline(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match === null) {
    return value;
  }
  return `${match[3]}/${match[2]}/${match[1].slice(-2)}`;
}

export function useMembershipLabels() {
  const locale = useLocale();
  const tPackages = useTranslations("userPages.packages");
  const tMarketing = useTranslations("marketing");

  return useMemo(
    () => ({
      formatStatusLabel: (status: UserPackageStatus) =>
        tPackages(`membershipStatus.${status}`),
      formatValidityLabel: (membership: Pick<
        UserMembershipRow,
        | "currentPeriodStart"
        | "currentPeriodEnd"
        | "plan"
        | "awaitingFirstVisit"
        | "activationDeadline"
      >) =>
        membership.awaitingFirstVisit === true
          ? tPackages("validityActivatesOnFirstVisit", {
              date: formatActivationDeadline(
                membership.activationDeadline ?? membership.currentPeriodStart,
              ),
            })
          : formatMembershipValidityRemaining(
              locale,
              computeRemainingValidityDays(membership),
              (key, values) => tPackages(key, values),
            ),
      formatSessionsSummary: (membership: UserMembershipRow) => {
        if (membership.isUnlimited) {
          return tMarketing("packagesSessionsUnlimited");
        }
        const total =
          membership.totalSessions ??
          membership.plan.sessionsPerMonth ??
          0;
        const remaining =
          membership.remainingSessions ?? membership.sessionsRemaining ?? 0;
        const used =
          membership.usedSessions ??
          Math.max(0, Math.min(total, total - remaining));
        return tPackages("sessionsUsedOfTotal", { used, total });
      },
    }),
    [locale, tMarketing, tPackages],
  );
}
