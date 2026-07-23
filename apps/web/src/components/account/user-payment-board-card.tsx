"use client";

import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  normalizePaymentSource,
  resolvePaymentMethodLabel,
  resolveRelatedItemName,
  statusBadgeClass,
  toPaymentIso,
} from "@/components/account/user-payment-display";
import { PaymentStatusReasonText } from "@/components/shared/payment-status-reason-text";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import type { UserPaymentRow } from "@/lib/user-package-types";

type UserPaymentBoardCardProps = {
  locale: string;
  payment: UserPaymentRow;
};

export function UserPaymentBoardCard({ locale, payment }: UserPaymentBoardCardProps) {
  const t = useTranslations("userPages.payments");
  const source = normalizePaymentSource(payment.description);
  const relatedItem = resolveRelatedItemName(payment.description);
  const itemLabel = relatedItem ?? t(`source.${source}`);
  const methodLabel = resolvePaymentMethodLabel(payment.paymentMethod, t);
  const paidAtIso = toPaymentIso(payment.createdAt);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <SessionClassTitle
        variant="board"
        eyebrow={t(`source.${source}`)}
        name={itemLabel}
        trailing={
          <div className="flex flex-col items-end">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(payment.status)}`}
            >
              {t(`status.${payment.status}`)}
            </span>
            <PaymentStatusReasonText
              status={payment.status}
              reason={payment.statusReason}
              className="mt-1 max-w-[9rem] text-right text-[10px] font-medium leading-snug text-sage-500"
            />
          </div>
        }
      />

      <SessionDateTimeHighlight
        locale={locale}
        startsAt={paidAtIso}
        endsAt={paidAtIso}
        variant="boardDateYear"
        className="mt-5"
      />

      <div className="mt-5 flex items-end justify-between gap-4 border-b border-white/70 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("table.amount")}
          </p>
          <AmdMoneyText
            cents={payment.amountCents}
            locale={locale}
            className="mt-1 block font-serif text-2xl leading-none tracking-tight text-sage-950 sm:text-[1.75rem]"
          />
        </div>
      </div>

      <dl className="mt-5 flex-1 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/60 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("table.paymentMethod")}
          </dt>
          <dd className="font-medium text-sage-900">{methodLabel}</dd>
        </div>
      </dl>
    </article>
  );
}
