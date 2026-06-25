"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { CancelGlyph, CheckCircleGlyph } from "@/components/ui/admin-action-glyphs";
import {
  paymentCheckoutReturnPath,
  type PaymentCheckoutSource,
} from "@/lib/payment-checkout-source";
import { PAYMENT_FAIL_PATH } from "@/lib/payment-result-paths";
import styles from "./payment-outcome-screen.module.css";

const PAYMENT_BRAND_MARK_SRC = "/marketing/home/brand-mark.webp";

type PaymentOutcomeScreenProps = {
  outcome: "success" | "failed";
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
  const returnPath = paymentCheckoutReturnPath(source);
  const retryHref =
    reference !== null
      ? `/user/payments/checkout?${new URLSearchParams({ source, reference }).toString()}`
      : PAYMENT_FAIL_PATH;

  return (
    <section className={styles.panel}>
      <Link href="/" className={styles.brandLink} aria-label={tNav("home")}>
        <Image
          src={PAYMENT_BRAND_MARK_SRC}
          alt={tCommon("brand")}
          width={72}
          height={72}
          className={styles.brandMark}
          priority
        />
      </Link>

      <div
        className={`${styles.iconRing} ${
          isSuccess ? styles.iconRingSuccess : styles.iconRingFailed
        }`}
      >
        {isSuccess ? (
          <CheckCircleGlyph className={styles.iconGlyph} />
        ) : (
          <CancelGlyph className={styles.iconGlyph} />
        )}
      </div>

      <p className={`${styles.eyebrow} text-sage-500`}>
        {tCheckout(`sources.${source}.eyebrow`)}
      </p>
      <h1 className={`${styles.title} text-sage-950`}>
        {isSuccess ? t(`sources.${source}.successTitle`) : t(`sources.${source}.failedTitle`)}
      </h1>
      <p
        className={`${styles.statusPill} ${
          isSuccess ? styles.statusPillSuccess : styles.statusPillFailed
        }`}
      >
        {isSuccess ? t("statusSuccess") : t("statusFailed")}
      </p>
      <p className={`${styles.lead} text-sage-600`}>
        {isSuccess ? t(`sources.${source}.successLead`) : t(`sources.${source}.failedLead`)}
      </p>

      <div className={styles.actions}>
        <Link href={returnPath}>
          <OmmButton type="button">{t("doneButton")}</OmmButton>
        </Link>
        {!isSuccess ? (
          <Link href={retryHref} className="ommm-cta-ghost inline-flex justify-center">
            {t("retryButton")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
