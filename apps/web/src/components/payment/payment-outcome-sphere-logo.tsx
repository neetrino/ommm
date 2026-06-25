"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HomeFooterSphereBounce } from "@/components/marketing/home/home-footer-sphere-bounce";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { measurePaymentOutcomeSphereGroundY } from "@/components/payment/payment-outcome-sphere-ground";
import {
  PAYMENT_OUTCOME_SPHERE_BOUNCE,
  PAYMENT_OUTCOME_SPHERE_SIZE,
} from "@/components/payment/payment-outcome-sphere-tokens";
import styles from "./payment-outcome-sphere-logo.module.css";

type PaymentOutcomeSphereLogoProps = {
  alt: string;
  homeAriaLabel: string;
};

export function PaymentOutcomeSphereLogo({
  alt,
  homeAriaLabel,
}: PaymentOutcomeSphereLogoProps) {
  const stageStyle = {
    "--payment-sphere-width": `${PAYMENT_OUTCOME_SPHERE_SIZE.widthPx}px`,
    "--payment-sphere-height": `${PAYMENT_OUTCOME_SPHERE_SIZE.heightPx}px`,
    "--payment-sphere-bounce-drop": `${PAYMENT_OUTCOME_SPHERE_BOUNCE.maxDropPx}px`,
  } as CSSProperties;

  return (
    <div className={styles.stage} data-payment-sphere-stage style={stageStyle}>
      <Link href="/" className={styles.homeLink} aria-label={homeAriaLabel}>
        <HomeFooterSphereBounce
          className={styles.frame}
          bounceConfig={PAYMENT_OUTCOME_SPHERE_BOUNCE}
          measureGroundY={measurePaymentOutcomeSphereGroundY}
        >
          <Image
            src={HOME_SECTION_ASSETS.footerIllustration}
            alt={alt}
            fill
            sizes={`${PAYMENT_OUTCOME_SPHERE_SIZE.widthPx}px`}
            className={styles.illustration}
            priority
          />
        </HomeFooterSphereBounce>
      </Link>
    </div>
  );
}
