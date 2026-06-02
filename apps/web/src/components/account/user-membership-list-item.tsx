"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { UserPackageLifecycleActions } from "@/components/account/user-package-lifecycle-actions";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

type UserMembershipListItemProps = {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
};

export function UserMembershipListItem({
  membership,
  locale,
  status,
}: UserMembershipListItemProps) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const titleId = useId();

  const sessionsLabel =
    membership.sessionsRemaining === null
      ? m("packagesSessionsUnlimited")
      : t("sessionsLeft", { count: membership.sessionsRemaining });

  return (
    <li>
      <button
        type="button"
        aria-expanded={detailsOpen}
        aria-controls={`membership-details-${membership.id}`}
        className={`ommm-list-row ommm-membership-row-interactive flex w-full flex-col items-stretch gap-3 text-left ${
          detailsOpen ? "ommm-membership-row-selected" : ""
        }`}
        data-selected={detailsOpen ? "true" : "false"}
        onClick={() => setDetailsOpen(true)}
      >
        <MembershipSummary
          membership={membership}
          locale={locale}
          status={status}
          sessionsLabel={sessionsLabel}
          statusLabel={formatMembershipStatus(status, t)}
        />
      </button>

      <OmmModalPortal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        backdropAriaLabel={t("membershipDetailsCloseBackdrop")}
        overlayClassName="ommm-modal-overlay z-[105]"
        panelClassName="w-full max-w-lg rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md"
      >
        <div id={`membership-details-${membership.id}`} className="flex flex-col gap-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
                {membership.plan.name}
              </h2>
              <span className={memberStatusClass(status)}>
                {formatMembershipStatus(status, t)}
              </span>
            </div>
            <p className="text-sm text-sage-600">{t("membershipDetailsLead")}</p>
          </header>

          <dl className="space-y-3 rounded-2xl border border-white/60 bg-white/50 p-4">
            <DetailRow label={t("membershipDetailsCategory")} value={membership.plan.categoryName} />
            <DetailRow
              label={t("membershipDetailsPrice")}
              value={formatAmdFromCents(membership.plan.priceCents, locale)}
            />
            <DetailRow
              label={t("membershipDetailsDuration")}
              value={m("packagesPeriodDaysShort", { days: membership.plan.periodDays })}
            />
            <DetailRow label={t("membershipDetailsSessions")} value={sessionsLabel} />
            <DetailRow
              label={t("membershipDetailsPeriodEnd")}
              value={formatDateForUi(membership.currentPeriodEnd)}
            />
            <DetailRow
              label={t("membershipDetailsStatus")}
              value={formatMembershipStatus(status, t)}
            />
          </dl>

          {status === "PENDING" ? (
            <p className="text-sm text-sage-600">{t("awaitingPaymentConfirmation")}</p>
          ) : null}

          <UserPackageLifecycleActions userPackageId={membership.id} status={status} />

          <div className="flex justify-end border-t border-white/60 pt-4">
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setDetailsOpen(false)}
            >
              {t("membershipDetailsClose")}
            </OmmButton>
          </div>
        </div>
      </OmmModalPortal>
    </li>
  );
}

function MembershipSummary({
  membership,
  locale,
  status,
  sessionsLabel,
  statusLabel,
}: {
  membership: UserMembershipRow;
  locale: string;
  status: UserPackageStatus;
  sessionsLabel: string;
  statusLabel: string;
}) {
  const t = useTranslations("userPages.packages");
  const m = useTranslations("marketing");

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-sage-800">{membership.plan.name}</p>
        <span className={memberStatusClass(status)}>{statusLabel}</span>
      </div>
      <p className="mt-1 text-sm text-sage-500">
        {membership.plan.categoryName} ·{" "}
        {formatAmdFromCents(membership.plan.priceCents, locale)} ·{" "}
        {m("packagesPeriodDaysShort", { days: membership.plan.periodDays })}
      </p>
      <p className="mt-2 text-sm text-sage-600">{sessionsLabel}</p>
      <p className="mt-1 text-sm text-sage-500">
        {t("renewsEnds", { date: formatDateForUi(membership.currentPeriodEnd) })}
      </p>
      {status === "PENDING" ? (
        <p className="mt-2 text-sm text-sage-600">{t("awaitingPaymentConfirmation")}</p>
      ) : null}
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-sand-600">
        {t("membershipViewDetailsHint")}
      </p>
    </div>
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

function formatMembershipStatus(
  status: UserPackageStatus,
  t: (key: string) => string,
): string {
  return t(`membershipStatus.${status}`);
}

function memberStatusClass(status: UserPackageStatus): string {
  const base =
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]";
  if (status === "ACTIVE") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (status === "PENDING") {
    return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (status === "PAUSED") {
    return `${base} border-sand-300 bg-sand-50 text-sage-700`;
  }
  return `${base} border-white/70 bg-white/70 text-sage-600`;
}
