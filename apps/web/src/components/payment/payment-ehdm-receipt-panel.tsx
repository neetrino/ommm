"use client";

import { useTranslations } from "next-intl";
import type { PaymentOutcomeEhdmReceipt } from "@/lib/payment-outcome-types";
import styles from "./payment-ehdm-receipt.module.css";

type PaymentEhdmReceiptPanelProps = {
  receipt: PaymentOutcomeEhdmReceipt | null;
  loading?: boolean;
};

export function PaymentEhdmReceiptPanel({
  receipt,
  loading = false,
}: PaymentEhdmReceiptPanelProps) {
  const t = useTranslations("userPages.payments.result.ehdm");

  if (loading) {
    return (
      <div className={styles.receiptBlock}>
        <p className={`${styles.receiptTitle} text-sage-800`}>{t("title")}</p>
        <p className={`${styles.receiptHint} text-sage-500`}>{t("loading")}</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className={styles.receiptBlock}>
        <p className={`${styles.receiptTitle} text-sage-800`}>{t("title")}</p>
        <p className={`${styles.receiptHint} text-sage-500`}>{t("missing")}</p>
      </div>
    );
  }

  return (
    <div className={styles.receiptBlock}>
      <p className={`${styles.receiptTitle} text-sage-800`}>{t("title")}</p>
      <dl className={styles.receiptList}>
        <div className={styles.receiptRow}>
          <dt className="text-sage-500">{t("receiptId")}</dt>
          <dd className="text-sage-900">
            <span className={styles.receiptIdValue}>{receipt.receiptId}</span>
            {receipt.isMock ? (
              <span className={styles.receiptMockBadge}>{t("mockBadge")}</span>
            ) : null}
          </dd>
        </div>
        {receipt.fiscal ? (
          <div className={styles.receiptRow}>
            <dt className="text-sage-500">{t("fiscal")}</dt>
            <dd className="text-sage-900">{receipt.fiscal}</dd>
          </div>
        ) : null}
        {receipt.qr ? (
          <div className={styles.receiptRow}>
            <dt className="text-sage-500">{t("qr")}</dt>
            <dd>
              <a
                href={receipt.qr}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.receiptLink} text-sage-700`}
              >
                {t("openQr")}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
