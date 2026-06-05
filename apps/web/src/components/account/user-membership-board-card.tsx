"use client";

import { useTranslations } from "next-intl";
import {
  buildMembershipDisplayModel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import { OmmButton } from "@/components/ui/omm-button";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipBoardCardProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  onOpenDetails: () => void;
};

export function UserMembershipBoardCard({
  membership,
  locale,
  status,
  onOpenDetails,
}: UserMembershipBoardCardProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const display = buildMembershipDisplayModel(membership, status, t, m);
  const priceLabel = formatAmdFromCents(membership.plan.priceCents, locale);
  const durationLabel = m("packagesPeriodDaysShort", { days: membership.plan.periodDays });

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {membership.plan.categoryName}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {display.sessionName}
          </h3>
        </div>
        <span className={memberStatusClassName(status)}>{display.statusLabel}</span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-b border-white/70 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("membershipDetailsPrice")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-sage-950">{priceLabel}</p>
        </div>
        <p className="text-sm text-sage-600">{durationLabel}</p>
      </div>

      <dl className="mt-5 grid flex-1 gap-3 text-sm text-sage-700">
        <MembershipFact label={t("membershipDetailsSessions")} value={display.sessionsLabel} />
        {display.sessionsUsedLabel !== null ? (
          <MembershipFact
            label={t("membershipDetailsSessionsUsed")}
            value={display.sessionsUsedLabel}
          />
        ) : null}
        <MembershipFact
          label={t("membershipDetailsPeriodStart")}
          value={formatDateForUi(membership.currentPeriodStart)}
        />
        <MembershipFact
          label={t("membershipDetailsPeriodEnd")}
          value={formatDateForUi(membership.currentPeriodEnd)}
        />
      </dl>

      {status === "PENDING" ? (
        <p className="mt-4 text-sm text-sage-600">{t("awaitingPaymentConfirmation")}</p>
      ) : null}

      <div className="mt-5 border-t border-white/70 pt-4">
        <OmmButton type="button" variant="secondary" size="md" className="w-full" onClick={onOpenDetails}>
          {t("viewDetails")}
        </OmmButton>
      </div>
    </article>
  );
}

function MembershipFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sage-600">{label}</dt>
      <dd className="text-right font-medium text-sage-800">{value}</dd>
    </div>
  );
}
