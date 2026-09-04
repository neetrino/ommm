"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTranslations } from "next-intl";
import { PaymentEhdmReceiptPaper } from "@/components/payment/payment-ehdm-receipt-paper";
import { OmmButton } from "@/components/ui/omm-button";
import { formatDateTimeForUi } from "@/lib/date-display";
import {
  buildEhdmQrImageUrl,
  formatEhdmReceiptTime,
} from "@/lib/ehdm-receipt-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PaymentOutcomePayload } from "@/lib/payment-outcome-types";
import styles from "./payment-ehdm-receipt-printer.module.css";

const PRINT_DURATION_MS = 2800;

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
              <PaymentEhdmReceiptPaper
                brandName={t("brandName")}
                brandSubtitle={t("brandSubtitle")}
                amountLabel={formatAmdFromCents(payload.amountCents, locale)}
                metaLine={`${paidLabel} | ${t("paidBadge")}`}
                itemLabel={itemLabel}
                itemPrice={formatAmdFromCents(payload.amountCents, locale)}
                totalLabel={t("totalLabel")}
                totalValue={formatAmdFromCents(
                  receipt.total ?? payload.amountCents,
                  locale,
                )}
                fiscalLabel={t("fiscal")}
                fiscalValue={receipt.fiscal}
                receiptIdLabel={t("receiptId")}
                receiptId={receipt.receiptId}
                taxpayerLabel={t("taxpayer")}
                taxpayer={receipt.taxpayer}
                tinLabel={t("tin")}
                tin={receipt.tin}
                timeLabel={t("time")}
                issuedAt={formatEhdmReceiptTime(receipt.time, locale)}
                referenceLabel={t("referenceLabel")}
                reference={payload.paymentReference ?? "—"}
                footerNote={t("footerNote")}
                txnId={receipt.receiptId}
                qrUrl={receipt.qr ? buildEhdmQrImageUrl(receipt.qr) : null}
                qrAlt={t("qr")}
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
