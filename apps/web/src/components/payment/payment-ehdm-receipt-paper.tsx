import Image from "next/image";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import styles from "./payment-ehdm-receipt-printer.module.css";

const RECEIPT_LOGO_SIZE_PX = 34;

export type PaymentEhdmReceiptPaperProps = {
  brandName: string;
  brandSubtitle: string;
  amountLabel: string;
  metaLine: string;
  itemLabel: string;
  itemPrice: string;
  totalLabel: string;
  totalValue: string;
  fiscalLabel: string;
  fiscalValue: string | null;
  receiptIdLabel: string;
  receiptId: string;
  taxpayerLabel: string;
  taxpayer: string | null;
  tinLabel: string;
  tin: string | null;
  timeLabel: string;
  issuedAt: string;
  referenceLabel: string;
  reference: string;
  footerNote: string;
  txnId: string;
  qrUrl: string | null;
  qrAlt: string;
};

export function PaymentEhdmReceiptPaper(props: PaymentEhdmReceiptPaperProps) {
  return (
    <>
      <div className={styles.paperHeader}>
        <div className={styles.brandBlock}>
          <p className={styles.brandName}>{props.brandName}</p>
          <div className={styles.brandSubtitleRow}>
            <p className={styles.brandSubtitle}>{props.brandSubtitle}</p>
          </div>
        </div>
        <div className={styles.brandMark} aria-hidden>
          <Image
            src={HOME_SECTION_ASSETS.footerIllustration}
            alt=""
            width={RECEIPT_LOGO_SIZE_PX}
            height={RECEIPT_LOGO_SIZE_PX}
            className={styles.brandMarkImage}
          />
        </div>
      </div>
      <ReceiptPaperBody {...props} />
    </>
  );
}

function ReceiptPaperBody(props: PaymentEhdmReceiptPaperProps) {
  return (
    <>
      <div className={styles.amountBlock}>
        <p className={styles.amount}>{props.amountLabel}</p>
        <p className={styles.metaLine}>{props.metaLine}</p>
      </div>
      <div className={styles.items}>
        <div className={styles.itemRow}>
          <span className={styles.itemName}>{props.itemLabel}</span>
          <span className={styles.itemPrice}>{props.itemPrice}</span>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.totals}>
        <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
          <span>{props.totalLabel}</span>
          <span>{props.totalValue}</span>
        </div>
      </div>
      <ReceiptPaperFiscal {...props} />
      <p className={styles.footerNote}>{props.footerNote}</p>
      <div className={styles.barcode} aria-hidden />
      <p className={styles.txnId}>{props.txnId}</p>
    </>
  );
}

function ReceiptPaperFiscal(props: PaymentEhdmReceiptPaperProps) {
  return (
    <div className={styles.fiscalBlock}>
      <p>
        {props.receiptIdLabel}: {props.receiptId}
      </p>
      {props.fiscalValue ? (
        <p>
          {props.fiscalLabel}: {props.fiscalValue}
        </p>
      ) : null}
      {props.taxpayer ? (
        <p>
          {props.taxpayerLabel}: {props.taxpayer}
        </p>
      ) : null}
      {props.tin ? (
        <p>
          {props.tinLabel}: {props.tin}
        </p>
      ) : null}
      {props.issuedAt ? (
        <p>
          {props.timeLabel}: {props.issuedAt}
        </p>
      ) : null}
      <p>
        {props.referenceLabel}: {props.reference}
      </p>
      {props.qrUrl ? (
        <img
          src={props.qrUrl}
          alt={props.qrAlt}
          width={120}
          height={120}
          className={styles.receiptQr}
        />
      ) : null}
    </div>
  );
}
