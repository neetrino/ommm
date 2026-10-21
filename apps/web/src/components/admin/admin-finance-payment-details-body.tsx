"use client";

import { useTranslations } from "next-intl";
import { formatPaymentTime } from "@/components/account/user-payment-display";
import { useStaffPaymentEditors } from "@/components/admin/admin-staff-payment-editors";
import { AdminFinancePaymentMethodPicker } from "@/components/admin/admin-finance-payment-method-picker";
import { AdminFinancePaymentStatusPicker } from "@/components/admin/admin-finance-payment-status-picker";
import {
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financeSourceTone,
} from "@/components/admin/admin-finance-list-display";
import {
  AdminFinancePaymentPaidDate,
  isPaidDateEditable,
} from "@/components/admin/admin-finance-payment-paid-date";
import {
  DETAILS_CARD_FOOTER_CLASS,
  DetailsCard,
  DetailsDateTime,
  DetailsField,
  DetailsFieldRow,
  DetailsStack,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  CheckCircleGlyph,
  LinkGlyph,
  WalletGlyph,
} from "@/components/shared/details/details-glyphs";
import {
  isEhdmReceiptMissing,
  paymentPurchaseFields,
} from "@/components/admin/admin-finance-payment-details-rows";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { readGiftDiscountCents } from "@/components/admin/admin-finance-gift-discount";
import { PaymentStatusReasonText } from "@/components/shared/payment-status-reason-text";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import type { AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { formatDateForUi } from "@/lib/date-display";

type FinanceT = ReturnType<typeof useTranslations<"adminPages.finance">>;

type PaymentDetailsBodyProps = {
  payment: FinancePaymentItem;
  locale: string;
  userLabel: string;
  canEditPaidAt: boolean;
  onPaymentUpdated: (payment: FinancePaymentItem) => void;
  onToast: (message: string, tone: AdminCenterToastTone) => void;
};

type SectionProps = PaymentDetailsBodyProps & { t: FinanceT };

/** Payment card (status, totals, paid date) followed by the linked customer and purchase. */
export function AdminFinancePaymentDetailsBody(props: PaymentDetailsBodyProps) {
  const t = useTranslations("adminPages.finance");
  return (
    <DetailsStack>
      <PaymentCard {...props} t={t} />
      <LinkedCard {...props} t={t} />
    </DetailsStack>
  );
}

function PaymentCard(props: SectionProps) {
  const { payment, t, canEditPaidAt } = props;
  return (
    <DetailsCard
      title={t("paymentDetails.sections.payment")}
      icon={<WalletGlyph />}
      aside={
        <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeSourceTone(payment.source)}`}>
          {t(`sources.${payment.source}`)}
        </span>
      }
    >
      <StatusFields {...props} />
      <div>
        <PaymentSummary {...props} />
        <AmountBreakdown {...props} />
      </div>
      {isPaidDateEditable(payment, canEditPaidAt) ? (
        <AdminFinancePaymentPaidDate
          payment={payment}
          onSaved={(confirmedAt) => {
            props.onPaymentUpdated({ ...payment, confirmedAt });
            props.onToast(t("paymentActions.paidDateUpdated"), "ok");
          }}
          onError={(message) => props.onToast(message, "err")}
        />
      ) : null}
      <EhdmFooter payment={payment} t={t} />
    </DetailsCard>
  );
}

function StatusFields({ payment, t, onPaymentUpdated, onToast }: SectionProps) {
  const editors = useStaffPaymentEditors({
    paymentId: payment.id,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    onUpdated: (next) => {
      onPaymentUpdated({
        ...payment,
        status: next.status,
        paymentMethod: next.paymentMethod,
        confirmedAt:
          next.status === "PENDING" ? null : (payment.confirmedAt ?? new Date().toISOString()),
      });
    },
    onError: (message) => onToast(message, "err"),
  });

  return (
    <div className="space-y-2">
      <DetailsFieldRow>
        <DetailsField label={t("table.colStatus")}>
          <AdminFinancePaymentStatusPicker
            status={payment.status}
            paymentMethod={payment.paymentMethod}
            busy={editors.busy}
            onChangeStatus={editors.changeStatus}
          />
        </DetailsField>
        <DetailsField label={t("table.colPaymentMethod")}>
          <AdminFinancePaymentMethodPicker
            paymentMethod={payment.paymentMethod}
            busy={editors.busy}
            onChangeMethod={editors.changeMethod}
          />
        </DetailsField>
      </DetailsFieldRow>
      <PaymentStatusReasonText
        status={payment.status}
        reason={payment.statusReason}
        className="px-1 text-xs text-sage-500"
      />
    </div>
  );
}

function PaymentSummary({ payment, locale, t }: SectionProps) {
  return (
    <DetailsStatStrip>
      <DetailsStat label={t("table.colAmount")} icon={<WalletGlyph />} tone="mint">
        <AmdMoneyText cents={payment.amountCents} locale={locale} className="font-serif text-lg" />
      </DetailsStat>
      <DetailsStat label={t("table.colDate")} icon={<CalendarGlyph />} tone="blue">
        <StatDateTime iso={payment.createdAt} locale={locale} />
      </DetailsStat>
      <DetailsStat label={t("table.colPaidDate")} icon={<CheckCircleGlyph />} tone="peach">
        {payment.confirmedAt ? (
          <StatDateTime iso={payment.confirmedAt} locale={locale} />
        ) : (
          <span className="font-medium text-sage-500">{t("paymentDetails.paidDateEmpty")}</span>
        )}
      </DetailsStat>
    </DetailsStatStrip>
  );
}

function StatDateTime({ iso, locale }: { iso: string; locale: string }) {
  return <DetailsDateTime date={formatDateForUi(iso)} time={formatPaymentTime(iso, locale)} />;
}

function AmountBreakdown({ payment, locale, t }: SectionProps) {
  const gift = readGiftDiscountCents(payment.giftCreditsAppliedCents);
  const coupon = readGiftDiscountCents(payment.coupon?.discountAmountCents);
  if (gift <= 0 && coupon <= 0) {
    return null;
  }
  const couponLabel = [t("paymentDetails.couponDiscount"), payment.coupon?.code]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3 text-xs text-sage-500">
      <span>
        {t("paymentDetails.listPrice")}{" "}
        <AmdMoneyText
          cents={payment.amountCents + gift + coupon}
          locale={locale}
          className="line-through"
        />
      </span>
      {coupon > 0 ? (
        <span>
          {couponLabel} −<AmdMoneyText cents={coupon} locale={locale} />
        </span>
      ) : null}
      {gift > 0 ? (
        <span>
          {t("paymentDetails.giftDiscount")} −<AmdMoneyText cents={gift} locale={locale} />
        </span>
      ) : null}
    </div>
  );
}

function EhdmFooter({ payment, t }: { payment: FinancePaymentItem; t: FinanceT }) {
  if (!isEhdmReceiptMissing(payment)) {
    return null;
  }
  return (
    <div className={`${DETAILS_CARD_FOOTER_CLASS} justify-between text-sm`}>
      <span className="font-medium text-sage-700">{t("paymentDetails.ehdmReceipt")}</span>
      <span className="text-sage-500">{t("paymentDetails.ehdmReceiptMissing")}</span>
    </div>
  );
}

function LinkedCard({ payment, userLabel, t }: SectionProps) {
  const purchase = paymentPurchaseFields(t, payment);
  return (
    <DetailsCard title={t("paymentDetails.sections.linked")} icon={<LinkGlyph />}>
      <DetailsFieldRow>
        <DetailsField label={t("paymentDetails.customer")} title={userLabel}>
          {userLabel}
        </DetailsField>
        <DetailsField label={t("paymentDetails.email")} title={payment.user.email}>
          {payment.user.email}
        </DetailsField>
      </DetailsFieldRow>
      <DetailsFieldRow>
        {purchase.map((field) => (
          <DetailsField
            key={field.label}
            label={field.label}
            title={field.value}
            wide={purchase.length === 1}
          >
            {field.value}
          </DetailsField>
        ))}
      </DetailsFieldRow>
    </DetailsCard>
  );
}
