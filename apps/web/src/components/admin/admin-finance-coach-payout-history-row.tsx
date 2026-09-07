"use client";

import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  ADMIN_FINANCE_MONEY_CLASS,
  ADMIN_FINANCE_PRIMARY_TITLE_CLASS,
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financeCoachPayoutTone,
} from "@/components/admin/admin-finance-list-display";
import {
  ADMIN_FINANCE_COACH_LIST_COACH_CELL,
  ADMIN_FINANCE_COACH_LIST_MONEY_CELL,
  ADMIN_FINANCE_COACH_LIST_MONTH_CELL,
  ADMIN_FINANCE_COACH_PAYOUT_HISTORY_ROW_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import type { CoachSalaryPayoutHistoryItem } from "@/components/admin/admin-finance-types";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { displayPhoneOrEmail } from "@/lib/phone";

type AdminFinanceCoachPayoutHistoryRowProps = {
  locale: string;
  row: CoachSalaryPayoutHistoryItem;
  labels: {
    colCoach: string;
    colAmount: string;
    colMonth: string;
    colPaidAt: string;
    statusPaid: string;
  };
};

function periodMonthIso(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01T12:00:00.000Z`;
}

export function AdminFinanceCoachPayoutHistoryRow({
  locale,
  row,
  labels,
}: AdminFinanceCoachPayoutHistoryRowProps) {
  const coachName = coachCardDisplayName({
    name: row.coach.name,
    lastName: row.coach.lastName,
    email: row.coach.email,
    avatarUrl: null,
  });
  const contact = displayPhoneOrEmail(row.coach.phone, row.coach.email);

  return (
    <article className={ADMIN_FINANCE_COACH_PAYOUT_HISTORY_ROW_CLASS}>
      <div className={ADMIN_FINANCE_COACH_LIST_COACH_CELL}>
        <AdminListMobileLabel label={labels.colCoach} />
        <div className="min-w-0">
          <p className={ADMIN_FINANCE_PRIMARY_TITLE_CLASS}>{coachName}</p>
          {contact ? <p className="mt-0.5 truncate text-sm text-sage-500">{contact}</p> : null}
        </div>
      </div>
      <div className={ADMIN_FINANCE_COACH_LIST_MONEY_CELL}>
        <AdminListMobileLabel label={labels.colAmount} />
        <div className="flex flex-col items-start gap-2 md:items-center">
          <span className={ADMIN_FINANCE_MONEY_CLASS}>
            <AmdMoneyText cents={row.amountAmd} locale={locale} />
          </span>
          <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeCoachPayoutTone("paid")}`}>
            {labels.statusPaid}
          </span>
        </div>
      </div>
      <div className={ADMIN_FINANCE_COACH_LIST_MONTH_CELL}>
        <AdminListMobileLabel label={labels.colMonth} />
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={periodMonthIso(row.periodYear, row.periodMonth)}
          endsAt={periodMonthIso(row.periodYear, row.periodMonth)}
          variant="listDateYear"
        />
      </div>
      <div className={ADMIN_FINANCE_COACH_LIST_MONTH_CELL}>
        <AdminListMobileLabel label={labels.colPaidAt} />
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={row.paidAt}
          endsAt={row.paidAt}
          variant="listDateYear"
        />
      </div>
    </article>
  );
}
