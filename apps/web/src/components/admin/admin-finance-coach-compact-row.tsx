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

/** Small muted caption above a value inside a mobile stat chip. */
const MOBILE_STAT_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[0.08em] text-sage-500";

/** Mobile-only stat chip — pairs a caption with its value, two per row. */
const MOBILE_STAT_CHIP_CLASS = "min-w-0 rounded-2xl border border-sand-200/70 bg-sand-50/60 px-3.5 py-3";

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
  const contact = displayPhoneOrEmail(row.user.phone, row.user.email);
  const payoutStatusLabel =
    payoutStatus === "none" ? t("statusNone") : payoutStatus === "paid" ? t("statusPaid") : t("statusPending");

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
    <article
      role="button"
      tabIndex={0}
      aria-label={coachName}
      title={t("salaryBreakdownHint")}
      onClick={onOpenSessions}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenSessions();
        }
      }}
      className={ADMIN_FINANCE_COACH_LIST_ROW_CLASS}
    >
      {/* Mobile-only card: horizontal layout that fills the card width. */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={ADMIN_LIST_TITLE_TEXT_CLASS}>{coachName}</p>
            <p className="mt-0.5 truncate text-xs text-sage-500">{contact}</p>
          </div>
          <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeCoachPayoutTone(payoutStatus)} shrink-0`}>
            {payoutStatusLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={MOBILE_STAT_CHIP_CLASS}>
            <p className={MOBILE_STAT_LABEL_CLASS}>{t("colSalary")}</p>
            {row.salary ? (
              <AmdMoneyText cents={unpaidCents} locale={locale} className={`mt-1 block ${ADMIN_FINANCE_MONEY_CLASS}`} />
            ) : (
              <p className={`mt-1 ${ADMIN_FINANCE_MONEY_CLASS}`}>—</p>
            )}
          </div>
          <div className={MOBILE_STAT_CHIP_CLASS}>
            <p className={MOBILE_STAT_LABEL_CLASS}>{t("colSessions")}</p>
            <p className="mt-1 font-serif text-xl tabular-nums leading-none tracking-tight text-sage-950">
              {sessionCount}
            </p>
          </div>
        </div>

        {unpaidCents > 0 ? (
          <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            <OmmButton type="button" size="sm" disabled={busy} onClick={openConfirm} className="w-full">
              {t("markPaid")}
            </OmmButton>
            {error && !confirmOpen ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
          </div>
        ) : null}
      </div>

      {/* Desktop table row — six aligned columns matching the list header. */}
      <div className={`${ADMIN_FINANCE_COACH_LIST_COACH_CELL} hidden md:block`}>
        <p className={ADMIN_LIST_TITLE_TEXT_CLASS}>{coachName}</p>
        <p className="mt-0.5 truncate text-xs text-sage-500">{contact}</p>
      </div>

      <div className={`${ADMIN_FINANCE_COACH_LIST_MONEY_CELL} hidden md:block`}>
        {row.salary ? (
          <AmdMoneyText cents={unpaidCents} locale={locale} className={ADMIN_FINANCE_MONEY_CLASS} />
        ) : (
          <p className={ADMIN_FINANCE_MONEY_CLASS}>—</p>
        )}
      </div>

      <div className={`${ADMIN_FINANCE_COACH_LIST_SESSIONS_CELL} hidden`}>
        <p className="font-serif text-xl tabular-nums leading-none tracking-tight text-sage-950">
          {sessionCount}
        </p>
      </div>

      <div className={`${ADMIN_FINANCE_COACH_LIST_MONTH_CELL} hidden`}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={monthToIso(month)}
          endsAt={monthToIso(month)}
          variant="listDateYear"
        />
      </div>

      <div className={`${ADMIN_FINANCE_COACH_LIST_PAYOUT_CELL} hidden`}>
        <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeCoachPayoutTone(payoutStatus)}`}>
          {payoutStatusLabel}
        </span>
      </div>

      <div
        className={`${ADMIN_FINANCE_COACH_LIST_ACTIONS_CELL} hidden`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
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
        <p className="rounded-2xl border border-sand-500/25 bg-sand-100/70 px-3.5 py-3 text-sm leading-relaxed text-sage-700">
          {t("markPaidConfirmTip")}
        </p>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </OmmConfirmDialog>
    </article>
  );
}
