"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  ADMIN_FINANCE_MONEY_CLASS,
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financeCoachPayoutTone,
  type FinanceCoachPayoutStatus,
} from "@/components/admin/admin-finance-list-display";
import {
  ADMIN_FINANCE_COACH_LIST_ACTIONS_CELL,
  ADMIN_FINANCE_COACH_LIST_COACH_CELL,
  ADMIN_FINANCE_COACH_LIST_MONEY_CELL,
  ADMIN_FINANCE_COACH_LIST_MONTH_CELL,
  ADMIN_FINANCE_COACH_LIST_PAYOUT_CELL,
  ADMIN_FINANCE_COACH_LIST_ROW_CLASS,
  ADMIN_FINANCE_COACH_LIST_SESSIONS_CELL,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import type { CoachFinanceRow } from "@/components/admin/admin-finance-types";
import { displayPhoneOrEmail } from "@/lib/phone";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminFinanceCoachCompactRowProps = {
  locale: string;
  row: CoachFinanceRow;
  month: string;
  onOpenSessions: () => void;
};

function displayName(row: CoachFinanceRow): string {
  return coachCardDisplayName({
    name: row.user.name,
    lastName: row.user.lastName,
    email: row.user.email,
    avatarUrl: null,
  });
}

function resolvePayoutStatus(row: CoachFinanceRow): FinanceCoachPayoutStatus {
  if (!row.salary || row.salary.totalEarningsCents === 0) {
    return "none";
  }
  if (row.salary.pendingPayoutCents > 0) {
    return "pending";
  }
  return "paid";
}

function monthToIso(month: string): string {
  return `${month}-01T12:00:00.000Z`;
}

export function AdminFinanceCoachCompactRow({
  locale,
  row,
  month,
  onOpenSessions,
}: AdminFinanceCoachCompactRowProps) {
  const t = useTranslations("adminPages.finance.coachTab");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payoutStatus = resolvePayoutStatus(row);
  const sessionCount = row.salary?.completedSessions ?? row.totalClasses;
  const unpaidCents = row.salary?.pendingPayoutCents ?? 0;
  const coachName = displayName(row);

  function openConfirm(): void {
    if (busy || unpaidCents <= 0) {
      return;
    }
    setError(null);
    setConfirmOpen(true);
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmMarkPaid(): Promise<void> {
    if (busy || unpaidCents <= 0) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/coaches/admin/${row.coachProfileId}/salary-payouts`, {
        method: "POST",
        body: JSON.stringify({ month }),
      });
      setConfirmOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("markPaidFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={ADMIN_FINANCE_COACH_LIST_ROW_CLASS}>
      <div className={ADMIN_FINANCE_COACH_LIST_COACH_CELL}>
        <AdminListMobileLabel label={t("colCoach")} />
        <p className={ADMIN_LIST_TITLE_TEXT_CLASS}>{coachName}</p>
        <p className="mt-0.5 truncate text-xs text-sage-500">{displayPhoneOrEmail(row.user.phone, row.user.email)}</p>
      </div>

      <div className={ADMIN_FINANCE_COACH_LIST_MONEY_CELL}>
        <AdminListMobileLabel label={t("colSalary")} />
        {row.salary ? (
          <AmdMoneyText
            cents={unpaidCents}
            locale={locale}
            className={ADMIN_FINANCE_MONEY_CLASS}
          />
        ) : (
          <p className={ADMIN_FINANCE_MONEY_CLASS}>—</p>
        )}
      </div>

      <div className={ADMIN_FINANCE_COACH_LIST_SESSIONS_CELL}>
        <AdminListMobileLabel label={t("colSessions")} />
        <button
          type="button"
          className="font-serif text-xl tabular-nums leading-none tracking-tight text-sage-950 underline underline-offset-2 md:mx-auto"
          onClick={onOpenSessions}
        >
          {sessionCount}
        </button>
      </div>

      <div className={ADMIN_FINANCE_COACH_LIST_MONTH_CELL}>
        <AdminListMobileLabel label={t("colMonth")} />
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={monthToIso(month)}
          endsAt={monthToIso(month)}
          variant="listDateYear"
        />
      </div>

      <div className={ADMIN_FINANCE_COACH_LIST_PAYOUT_CELL}>
        <AdminListMobileLabel label={t("colPayoutStatus")} />
        <span
          className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeCoachPayoutTone(payoutStatus)}`}
        >
          {payoutStatus === "none"
            ? t("statusNone")
            : payoutStatus === "paid"
              ? t("statusPaid")
              : t("statusPending")}
        </span>
      </div>

      <div className={ADMIN_FINANCE_COACH_LIST_ACTIONS_CELL}>
        <AdminListMobileLabel label={t("colActions")} />
        {unpaidCents > 0 ? (
          <OmmButton type="button" size="sm" disabled={busy} onClick={openConfirm}>
            {t("markPaid")}
          </OmmButton>
        ) : (
          <span className="text-xs text-sage-400">—</span>
        )}
        {error && !confirmOpen ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
      </div>

      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("markPaidConfirmTitle")}
        description={t("markPaidConfirmDescription", {
          coach: coachName,
          month,
          amount: formatAmdFromCents(unpaidCents, locale),
        })}
        confirmLabel={busy ? t("markPaidBusy") : t("markPaidConfirm")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="success"
        confirmVariant="primary"
        forceCenteredModal
        pending={busy}
        onConfirm={() => {
          void confirmMarkPaid();
        }}
        onCancel={closeConfirm}
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </OmmConfirmDialog>
    </article>
  );
}
