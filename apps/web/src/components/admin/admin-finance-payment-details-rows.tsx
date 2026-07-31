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
