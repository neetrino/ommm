import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import {
  buildEhdmQrImageUrl,
  formatEhdmReceiptTime,
} from "@/lib/ehdm-receipt-display";
import { formatAmdFromCents } from "@/lib/price-amd";

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
  if (payment.status !== "SUCCEEDED" && payment.status !== "REFUNDED") {
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

  const qrUrl = receipt.qr ? buildEhdmQrImageUrl(receipt.qr) : null;
  const issuedAt = formatEhdmReceiptTime(receipt.time);

  return (
    <>
      <AdminFinancePaymentDetailRow
        label={t("paymentDetails.ehdmReceipt")}
        value={<span className="font-medium text-sage-800">{receipt.receiptId}</span>}
      />
      {receipt.fiscal ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmFiscal")}
          value={receipt.fiscal}
        />
      ) : null}
      {receipt.taxpayer ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmTaxpayer")}
          value={receipt.taxpayer}
        />
      ) : null}
      {receipt.tin ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmTin")}
          value={receipt.tin}
        />
      ) : null}
      {issuedAt ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmTime")}
          value={issuedAt}
        />
      ) : null}
      {receipt.total != null ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmTotal")}
          value={formatAmdFromCents(receipt.total)}
        />
      ) : null}
      {qrUrl ? (
        <AdminFinancePaymentDetailRow
          label={t("paymentDetails.ehdmQr")}
          value={
            <img
              src={qrUrl}
              alt={t("paymentDetails.ehdmQr")}
              width={120}
              height={120}
              className="h-[7.5rem] w-[7.5rem] rounded border border-sage-200 bg-white object-contain"
            />
          }
        />
      ) : null}
    </>
  );
}
