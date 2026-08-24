import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";

type FinanceT = ReturnType<typeof useTranslations<"adminPages.finance">>;

export function AdminFinancePaymentDetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>{value}</dd>
    </div>
  );
}

function resolveRelatedLabel(t: FinanceT, payment: FinancePaymentItem): string {
  if (payment.relatedItemName?.trim()) {
    return payment.relatedItemName;
  }
  if (payment.description?.trim()) {
    return payment.description;
  }
  if (payment.sourceId) {
    return t(`paymentDetails.related.${payment.source}`, { id: payment.sourceId });
  }
  return "—";
}

export function AdminFinancePaymentPackageRows({
  payment,
  t,
}: {
  payment: FinancePaymentItem;
  t: FinanceT;
}) {
  if (payment.source === "package") {
    const packageName = payment.relatedItemName?.trim() || "—";
    const groupName = payment.relatedItemGroupName?.trim() || "—";
    return (
      <>
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.groupName")}
          value={groupName}
        />
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.packageName")}
          value={packageName}
        />
      </>
    );
  }

  return (
    <AdminFinancePaymentDetailRow
      label={t("paymentDetails.relatedLabel")}
      value={resolveRelatedLabel(t, payment)}
    />
  );
}

export function AdminFinancePaymentEhdmRows({
  payment,
  t,
}: {
  payment: FinancePaymentItem;
  t: FinanceT;
}) {
  if (payment.status !== "SUCCEEDED") {
    return null;
  }

  const receipt = payment.ehdmReceipt;
  if (!receipt) {
    return (
      <AdminFinancePaymentDetailRow
        label={t("paymentDetails.ehdmReceipt")}
        value={
          <span className="text-sm text-sage-500">{t("paymentDetails.ehdmReceiptMissing")}</span>
        }
      />
    );
  }

  return (
    <>
      <AdminFinancePaymentDetailRow
        label={t("paymentDetails.ehdmReceipt")}
        value={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-medium text-sage-800">{receipt.receiptId}</span>
            {receipt.isMock ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {t("paymentDetails.ehdmReceiptMock")}
              </span>
            ) : null}
          </span>
        }
      />
      {receipt.fiscal ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmFiscal")}
          value={receipt.fiscal}
        />
      ) : null}
      {receipt.qr ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmQr")}
          value={
            <a
              href={receipt.qr}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-sage-700 underline decoration-sage-300 underline-offset-2 hover:text-sage-900"
            >
              {receipt.qr}
            </a>
          }
        />
      ) : null}
    </>
  );
}
