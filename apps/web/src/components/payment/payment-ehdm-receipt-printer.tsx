"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { OmmButton } from "@/components/ui/omm-button";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PaymentOutcomePayload } from "@/lib/payment-outcome-types";
import styles from "./payment-ehdm-receipt-printer.module.css";

const PRINT_DURATION_MS = 2800;
const RECEIPT_LOGO_SIZE_PX = 34;

type PrintPhase = "idle" | "printing" | "done";

type PaymentEhdmReceiptPrinterProps = {
  payload: PaymentOutcomePayload;
  locale: string;
};

export function PaymentEhdmReceiptPrinter({
  payload,
  locale,
}: PaymentEhdmReceiptPrinterProps) {
  const t = useTranslations("userPages.payments.result.ehdm");
  const paperRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<PrintPhase>("idle");
  const [paperHeight, setPaperHeight] = useState(0);
  const receipt = payload.ehdmReceipt;

  useLayoutEffect(() => {
    const node = paperRef.current;
    if (!node) {
      return;
    }
    setPaperHeight(node.scrollHeight);
  }, [payload, receipt]);

  const startPrint = useCallback(() => {
    const node = paperRef.current;
    if (node) {
      setPaperHeight(node.scrollHeight);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setPhase("done");
      return;
    }

    setPhase("printing");
    window.setTimeout(() => {
      setPhase("done");
    }, PRINT_DURATION_MS);
  }, []);

  const handleReprint = useCallback(() => {
    setPhase("idle");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        startPrint();
      });
    });
  }, [startPrint]);

  if (!receipt) {
    return null;
  }

  const viewportStyle: CSSProperties = {
    ["--receipt-paper-height" as string]: `${paperHeight}px`,
    maxHeight:
      phase === "idle"
        ? 0
        : phase === "printing" || phase === "done"
          ? paperHeight
          : 0,
  };

  const itemLabel = payload.description?.trim() || t("defaultItem");
  const paidLabel = formatDateTimeForUi(payload.paidAt, locale).toUpperCase();

  return (
    <div className={styles.printerRoot}>
      <div className={styles.printerAssembly}>
        <PrinterAssemblyHead />

        <div
          className={[
            styles.printerViewport,
            phase === "printing" ? styles.printerViewportPrinting : "",
            phase === "done" ? styles.printerViewportDone : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={viewportStyle}
          aria-live="polite"
        >
          <div ref={paperRef} className={styles.paperStack}>
            <div className={styles.paper}>
              <ReceiptPaperContent
                brandName={t("brandName")}
                brandSubtitle={t("brandSubtitle")}
                amountLabel={formatAmdFromCents(payload.amountCents, locale)}
                metaLine={`${paidLabel} | ${t("paidBadge")}`}
                isMock={receipt.isMock}
                mockBadge={t("mockBadge")}
                itemLabel={itemLabel}
                itemPrice={formatAmdFromCents(payload.amountCents, locale)}
                totalLabel={t("totalLabel")}
                totalValue={formatAmdFromCents(payload.amountCents, locale)}
                fiscalLabel={t("fiscal")}
                fiscalValue={receipt.fiscal}
                receiptIdLabel={t("receiptId")}
                receiptId={receipt.receiptId}
                referenceLabel={t("referenceLabel")}
                reference={payload.paymentReference ?? "—"}
                footerNote={t("footerNote")}
                txnId={receipt.receiptId}
              />
            </div>
            <div className={styles.tearEdge} aria-hidden />
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        {phase === "idle" ? (
          <OmmButton type="button" onClick={startPrint} className="w-full sm:w-auto">
            {t("printButton")}
          </OmmButton>
        ) : null}

        {phase === "done" ? (
          <div className={styles.controlRow}>
            <OmmButton type="button" variant="secondary" onClick={handleReprint}>
              {t("reprintButton")}
            </OmmButton>
            {receipt.qr ? (
              <a
                href={receipt.qr}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.verifyLink}
              >
                {t("openQr")}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Printer slot only — shown while receipt data is loading (no flash text). */
export function PaymentEhdmReceiptPrinterShell() {
  const t = useTranslations("userPages.payments.result.ehdm");

  return (
    <div className={styles.printerRoot}>
      <div className={styles.printerAssembly}>
        <PrinterAssemblyHead />
      </div>
      <div className={styles.controls}>
        <OmmButton type="button" disabled className="w-full sm:w-auto">
          {t("printButton")}
        </OmmButton>
      </div>
    </div>
  );
}

function PrinterAssemblyHead() {
  return (
    <div className={styles.printerChassis} aria-hidden>
      <div className={styles.printerFace}>
        <div className={styles.printerSlotTrack}>
          <div className={styles.printerSlot} />
        </div>
      </div>
      <div className={styles.printerPaperGuide} />
    </div>
  );
}

type ReceiptPaperContentProps = {
  brandName: string;
  brandSubtitle: string;
  amountLabel: string;
  metaLine: string;
  isMock: boolean;
  mockBadge: string;
  itemLabel: string;
  itemPrice: string;
  totalLabel: string;
  totalValue: string;
  fiscalLabel: string;
  fiscalValue: string | null;
  receiptIdLabel: string;
  receiptId: string;
  referenceLabel: string;
  reference: string;
  footerNote: string;
  txnId: string;
};

function ReceiptPaperContent({
  brandName,
  brandSubtitle,
  amountLabel,
  metaLine,
  isMock,
  mockBadge,
  itemLabel,
  itemPrice,
  totalLabel,
  totalValue,
  fiscalLabel,
  fiscalValue,
  receiptIdLabel,
  receiptId,
  referenceLabel,
  reference,
  footerNote,
  txnId,
}: ReceiptPaperContentProps) {
  return (
    <>
      <div className={styles.paperHeader}>
        <div className={styles.brandBlock}>
          <p className={styles.brandName}>{brandName}</p>
          <div className={styles.brandSubtitleRow}>
            <p className={styles.brandSubtitle}>{brandSubtitle}</p>
            {isMock ? <span className={styles.mockBadge}>{mockBadge}</span> : null}
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

      <div className={styles.amountBlock}>
        <p className={styles.amount}>{amountLabel}</p>
        <p className={styles.metaLine}>{metaLine}</p>
      </div>

      <div className={styles.items}>
        <div className={styles.itemRow}>
          <span className={styles.itemName}>{itemLabel}</span>
          <span className={styles.itemPrice}>{itemPrice}</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.totals}>
        <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
          <span>{totalLabel}</span>
          <span>{totalValue}</span>
        </div>
      </div>

      <div className={styles.fiscalBlock}>
        <p>
          {receiptIdLabel}: {receiptId}
        </p>
        {fiscalValue ? (
          <p>
            {fiscalLabel}: {fiscalValue}
          </p>
        ) : null}
        <p>
          {referenceLabel}: {reference}
        </p>
      </div>

      <p className={styles.footerNote}>{footerNote}</p>
      <div className={styles.barcode} aria-hidden />
      <p className={styles.txnId}>{txnId}</p>
    </>
  );
}
