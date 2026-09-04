"use client";

import { useTranslations } from "next-intl";
import {
  buildEhdmQrImageUrl,
  formatEhdmReceiptTime,
} from "@/lib/ehdm-receipt-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PaymentOutcomeEhdmReceipt } from "@/lib/payment-outcome-types";
import styles from "./payment-ehdm-receipt.module.css";

type PaymentEhdmReceiptPanelProps = {
  receipt: PaymentOutcomeEhdmReceipt | null;
  loading?: boolean;
  locale?: string;
};

export function PaymentEhdmReceiptPanel({
  receipt,
  loading = false,
  locale,
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

  const qrUrl = receipt.qr ? buildEhdmQrImageUrl(receipt.qr) : null;
  const issuedAt = formatEhdmReceiptTime(receipt.time, locale);

  return (
    <div className={styles.receiptBlock}>
      <p className={`${styles.receiptTitle} text-sage-800`}>{t("title")}</p>
      <dl className={styles.receiptList}>
        <ReceiptRow label={t("receiptId")} value={receipt.receiptId} strong />
        {receipt.fiscal ? <ReceiptRow label={t("fiscal")} value={receipt.fiscal} /> : null}
        {receipt.taxpayer ? (
          <ReceiptRow label={t("taxpayer")} value={receipt.taxpayer} />
        ) : null}
        {receipt.tin ? <ReceiptRow label={t("tin")} value={receipt.tin} /> : null}
        {issuedAt ? <ReceiptRow label={t("time")} value={issuedAt} /> : null}
        {receipt.total != null ? (
          <ReceiptRow
            label={t("total")}
            value={formatAmdFromCents(receipt.total, locale)}
          />
        ) : null}
        {qrUrl ? (
          <div className={styles.receiptRow}>
            <dt className="text-sage-500">{t("qr")}</dt>
            <dd>
              {/* eslint-disable-next-line @next/next/no-img-element -- EHDM QR is an absolute fiscal URL */}
              <img
                src={qrUrl}
                alt={t("qr")}
                width={120}
                height={120}
                className={styles.receiptQr}
              />
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={styles.receiptRow}>
      <dt className="text-sage-500">{label}</dt>
      <dd className="text-sage-900">
        <span className={strong ? styles.receiptIdValue : undefined}>{value}</span>
      </dd>
    </div>
  );
}
