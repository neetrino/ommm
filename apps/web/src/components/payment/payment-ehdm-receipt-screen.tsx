"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PaymentEhdmReceiptPanel } from "@/components/payment/payment-ehdm-receipt-panel";
import { PaymentEhdmReceiptPrinter } from "@/components/payment/payment-ehdm-receipt-printer";
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

  return (
    <section
      className={[styles.panel, showPrinter ? styles.panelWithPrinter : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {showPrinter ? (
        <div className={styles.receiptSectionTop}>
          <PaymentEhdmReceiptPrinter payload={outcome.payload} locale={locale} />
        </div>
      ) : (
        <>
          <p className={`${styles.receiptTitle} text-sage-500`}>
            {t("ehdm.pageEyebrow")}
          </p>
          <h1 className={`${styles.pageTitle} text-sage-950`}>{t("ehdm.pageTitle")}</h1>
          <div className={styles.receiptSection}>
            {outcome.kind === "loading" ? (
              <PaymentEhdmReceiptPanel receipt={null} loading />
            ) : outcome.kind === "not_found" ? (
              <PaymentEhdmReceiptPanel receipt={null} />
            ) : (
              <PaymentEhdmReceiptPanel receipt={outcome.payload.ehdmReceipt} />
            )}
          </div>
        </>
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
