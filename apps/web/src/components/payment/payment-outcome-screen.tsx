"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { CancelGlyph, CheckCircleGlyph } from "@/components/ui/admin-action-glyphs";
import {
  paymentCheckoutPath,
  paymentCheckoutReturnPath,
  type PaymentCheckoutSource,
} from "@/lib/payment-checkout-source";
import { PAYMENT_FAIL_PATH, buildPaymentReceiptPath } from "@/lib/payment-result-paths";
import { PaymentOutcomeSphereLogo } from "@/components/payment/payment-outcome-sphere-logo";
import { usePaymentEhdmOutcome } from "@/hooks/use-payment-ehdm-outcome";
import styles from "./payment-outcome-screen.module.css";

type PaymentOutcomeScreenProps = {
  outcome: "success" | "failed" | "pending";
  source: PaymentCheckoutSource;
  reference: string | null;
};

export function PaymentOutcomeScreen({
  outcome,
  source,
  reference,
}: PaymentOutcomeScreenProps) {
  const t = useTranslations("userPages.payments.result");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tCheckout = useTranslations("userPages.payments.checkout");
  const isSuccess = outcome === "success";
  const isPending = outcome === "pending";
  const returnPath = paymentCheckoutReturnPath(source);
  const retryHref =
    reference !== null
      ? `${paymentCheckoutPath(source)}?${new URLSearchParams(
          source === "gift"
            ? { reference }
            : { source, reference },
        ).toString()}`
      : PAYMENT_FAIL_PATH;

  const iconRingClass = isSuccess
    ? styles.iconRingSuccess
    : isPending
      ? styles.iconRingPending
      : styles.iconRingFailed;

  const titleKey = isSuccess
    ? "successTitle"
    : isPending
      ? "pendingTitle"
      : "failedTitle";
  const leadKey = isSuccess ? "successLead" : isPending ? "pendingLead" : "failedLead";

  return (
    <section className={styles.panel}>
      <PaymentOutcomeSphereLogo alt={tCommon("brand")} homeAriaLabel={tNav("home")} />

      <div className={`${styles.iconRing} ${iconRingClass}`}>
        {isSuccess ? (
          <CheckCircleGlyph className={styles.iconGlyph} />
        ) : isPending ? (
          <ClockGlyph className={styles.iconGlyph} />
        ) : (
          <CancelGlyph className={styles.iconGlyph} />
        )}
      </div>

      <p className={`${styles.eyebrow} text-sage-500`}>
        {tCheckout(`sources.${source}.eyebrow`)}
      </p>
      <h1 className={`${styles.title} text-sage-950`}>
        {t(`sources.${source}.${titleKey}`)}
      </h1>
      <p className={`${styles.lead} text-sage-600`}>{t(`sources.${source}.${leadKey}`)}</p>

      {isSuccess && reference !== null ? (
        <PaymentOutcomeReceiptLink reference={reference} source={source} />
      ) : null}

      <div className={styles.actions}>
        <Link href={returnPath}>
          <OmmButton type="button">{t("doneButton")}</OmmButton>
        </Link>
        {!isSuccess && !isPending ? (
          <Link href={retryHref} className="ommm-cta-ghost inline-flex justify-center">
            {t("retryButton")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function PaymentOutcomeReceiptLink({
  reference,
  source,
}: {
  reference: string;
  source: PaymentCheckoutSource;
}) {
  const t = useTranslations("userPages.payments.result");
  const outcome = usePaymentEhdmOutcome(reference);
  const receipt = outcome.kind === "ready" ? outcome.payload.ehdmReceipt : null;
  const showButton = receipt !== null;

  if (!showButton) {
    return null;
  }

  return (
    <div className={styles.receiptAction}>
      <Link
        href={buildPaymentReceiptPath(reference, source)}
        className="ommm-cta-ghost inline-flex justify-center"
      >
        {t("ehdm.viewReceiptButton")}
      </Link>
    </div>
  );
}

function ClockGlyph({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
