"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PaymentEhdmReceiptPanel } from "@/components/payment/payment-ehdm-receipt-panel";
import {
  PaymentEhdmReceiptPrinter,
  PaymentEhdmReceiptPrinterShell,
} from "@/components/payment/payment-ehdm-receipt-printer";
import { OmmButton } from "@/components/ui/omm-button";
import { usePaymentEhdmOutcome } from "@/hooks/use-payment-ehdm-outcome";
import {
  paymentCheckoutReturnPath,
  type PaymentCheckoutSource,
} from "@/lib/payment-checkout-source";
import { buildPaymentSuccessPath } from "@/lib/payment-result-paths";
import styles from "./payment-ehdm-receipt.module.css";

type PaymentEhdmReceiptScreenProps = {
  reference: string;
  source: PaymentCheckoutSource;
  locale: string;
};

export function PaymentEhdmReceiptScreen({
  reference,
  source,
  locale,
}: PaymentEhdmReceiptScreenProps) {
  const t = useTranslations("userPages.payments.result");
  const outcome = usePaymentEhdmOutcome(reference);
  const returnPath = paymentCheckoutReturnPath(source);
  const successPath = buildPaymentSuccessPath(reference, source);

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

      <div className={styles.actions}>
        <Link href={returnPath}>
          <OmmButton type="button">{t("doneButton")}</OmmButton>
        </Link>
        <Link href={successPath} className="ommm-cta-ghost inline-flex justify-center">
          {t("ehdm.backButton")}
        </Link>
      </div>
    </section>
  );
}
