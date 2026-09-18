"use client";

import { PaymentEhdmReceiptPanel } from "@/components/payment/payment-ehdm-receipt-panel";
import {
  PaymentEhdmReceiptPrinter,
  PaymentEhdmReceiptPrinterShell,
} from "@/components/payment/payment-ehdm-receipt-printer";
import { usePaymentEhdmOutcome } from "@/hooks/use-payment-ehdm-outcome";
import type { PaymentCheckoutSource } from "@/lib/payment-checkout-source";
import styles from "./payment-ehdm-receipt.module.css";

type PaymentEhdmReceiptScreenProps = {
  reference: string;
  source: PaymentCheckoutSource;
  locale: string;
};

export function PaymentEhdmReceiptScreen({
  reference,
  locale,
}: PaymentEhdmReceiptScreenProps) {
  const outcome = usePaymentEhdmOutcome(reference);

  const showPrinter =
    outcome.kind === "ready" &&
    outcome.payload.status === "SUCCEEDED" &&
    outcome.payload.ehdmReceipt !== null;

  const showPrinterShell = outcome.kind === "loading";

  return (
    <section
      className={[
        styles.panel,
        showPrinter || showPrinterShell ? styles.panelWithPrinter : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showPrinter ? (
        <div className={styles.receiptSectionTop}>
          <PaymentEhdmReceiptPrinter payload={outcome.payload} locale={locale} />
        </div>
      ) : showPrinterShell ? (
        <div className={styles.receiptSectionTop}>
          <PaymentEhdmReceiptPrinterShell />
        </div>
      ) : (
        <div className={styles.receiptSection}>
          <PaymentEhdmReceiptPanel receipt={null} />
        </div>
      )}
    </section>
  );
}
