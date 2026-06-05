"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { UserPackageLifecycleActions } from "@/components/account/user-package-lifecycle-actions";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  buildMembershipDisplayModel,
  formatMembershipStatusLabel,
  memberStatusClassName,
} from "@/components/account/user-membership-display";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipDetailsModalProps = {
  membership: UserMembershipRow | null;
  locale: string;
  status: UserPackageStatus;
  isOpen: boolean;
  onClose: () => void;
};

export function UserMembershipDetailsModal({
  membership,
  locale,
  status,
  isOpen,
  onClose,
}: UserMembershipDetailsModalProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const titleId = useId();

  if (membership === null) {
    return null;
  }

  const display = buildMembershipDisplayModel(membership, status, t, m);

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
      overlayClassName="ommm-modal-overlay z-[105]"
      panelClassName="w-full max-w-lg rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
              {display.sessionName}
            </h2>
            <span className={memberStatusClassName(status)}>
              {formatMembershipStatusLabel(status, t)}
            </span>
          </div>
          <p className="text-sm text-sage-600">{t("membershipDetailsLead")}</p>
        </header>

        <dl className="space-y-3 rounded-2xl border border-white/60 bg-white/50 p-4">
          <DetailRow label={t("membershipDetailsSessionName")} value={display.sessionName} />
          <DetailRow label={t("membershipDetailsCategory")} value={membership.plan.categoryName} />
          <DetailRow
            label={t("membershipDetailsPrice")}
            value={formatAmdFromCents(membership.plan.priceCents, locale)}
          />
          <DetailRow
            label={t("membershipDetailsDuration")}
            value={m("packagesPeriodDaysShort", { days: membership.plan.periodDays })}
          />
          <DetailRow label={t("membershipDetailsSessions")} value={display.sessionsSummary} />
          {display.sessionsRemainingSummary !== null ? (
            <DetailRow
              label={t("membershipDetailsSessionsRemaining")}
              value={display.sessionsRemainingSummary}
            />
          ) : null}
          {display.totalSessions !== null &&
          display.usedSessions !== null &&
          display.totalSessions > 0 ? (
            <div className="space-y-2 py-1">
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
                {t("membershipDetailsUsage")}
              </dt>
              <dd>
                <PackageUsageBar
                  used={display.usedSessions}
                  total={display.totalSessions}
                  ariaLabel={display.sessionsSummary}
                />
              </dd>
            </div>
          ) : null}
          <DetailRow
            label={t("membershipDetailsPeriodStart")}
            value={formatDateForUi(membership.currentPeriodStart)}
          />
          <DetailRow
            label={t("membershipDetailsPeriodEnd")}
            value={formatDateForUi(membership.currentPeriodEnd)}
          />
        </dl>

        {status === "PENDING" ? (
          <p className="text-sm text-sage-600">{t("awaitingPaymentConfirmation")}</p>
        ) : null}

        <UserPackageLifecycleActions userPackageId={membership.id} status={status} />

        <div className="flex justify-end border-t border-white/60 pt-4">
          <OmmButton type="button" variant="secondary" size="md" onClick={onClose}>
            {t("membershipDetailsClose")}
          </OmmButton>
        </div>
      </div>
    </OmmModalPortal>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">{label}</dt>
      <dd className="text-sm font-medium text-sage-800">{value}</dd>
    </div>
  );
}
