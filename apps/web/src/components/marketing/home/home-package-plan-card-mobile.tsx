import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "@/components/marketing/home/home-package-plan-card-mobile.module.css";
import type { HomePackagePlanCardProps } from "@/components/marketing/home/home-package-plan-card";
import {
  HOME_PLANS_SECTION_ASSETS,
  HOME_PLANS_SECTION_FIGMA,
  HOME_PLANS_SECTION_MOBILE_FIGMA,
} from "@/components/marketing/home/home-plans-section-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { Link } from "@/i18n/navigation";

function mobilePlanCardStyleVars(): CSSProperties {
  return {
    ["--home-plan-mobile-card-fallback-bg" as string]: HOME_PLANS_SECTION_FIGMA.cardFallbackBg,
    ["--home-plan-mobile-category-color" as string]: HOME_PLANS_SECTION_FIGMA.categoryColor,
    ["--home-plan-mobile-price-color" as string]: HOME_PLANS_SECTION_FIGMA.priceColor,
    ["--home-plan-mobile-category-size" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.categoryFontSizePx}px`,
    ["--home-plan-mobile-details-size" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.detailsFontSizePx}px`,
    ["--home-plan-mobile-price-size" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.priceFontSizePx}px`,
    ["--home-plan-mobile-glass-height" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.glassHeightPx}px`,
    ["--home-plan-mobile-cta-size" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.ctaIconSizePx}px`,
    ["--home-plan-mobile-image-crop-left" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.cardImageCropLeftPercent}%`,
    ["--home-plan-mobile-image-crop-top" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.cardImageCropTopPercent}%`,
    ["--home-plan-mobile-image-crop-width" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.cardImageCropWidthPercent}%`,
    ["--home-plan-mobile-image-crop-height" as string]: `${HOME_PLANS_SECTION_MOBILE_FIGMA.cardImageCropHeightPercent}%`,
  };
}

/** Figma mobile package card `104:6142`. */
export function HomePackagePlanCardMobile({
  planName,
  details,
  price,
  ctaAria,
}: HomePackagePlanCardProps) {
  return (
    <Link
      href="/packages"
      aria-label={ctaAria}
      className={`${marketingMontserrat.variable} ${styles.card}`}
      style={mobilePlanCardStyleVars()}
    >
      <div className={styles.cardMedia}>
        <div className={styles.imageCrop}>
          <div className={styles.imageFrame}>
            <Image
              src={HOME_PLANS_SECTION_ASSETS.cardBackground}
              alt=""
              fill
              sizes="85vw"
              className={styles.image}
              {...belowFoldImageProps()}
            />
          </div>
        </div>
        <p className={styles.category}>{planName}</p>
      </div>

      <div className={styles.priceGlass}>
        <div className={`${marketingMontserrat.className} ${styles.priceGlassContent}`}>
          <div className={styles.priceCopy}>
            <p className={styles.details}>{details}</p>
            <p className={styles.price}>{price}</p>
          </div>
          <span className={styles.ctaFab} aria-hidden>
            <Image
              src={HOME_PLANS_SECTION_ASSETS.cardFab}
              alt=""
              width={HOME_PLANS_SECTION_MOBILE_FIGMA.ctaIconSizePx}
              height={HOME_PLANS_SECTION_MOBILE_FIGMA.ctaIconSizePx}
              unoptimized
              className={styles.ctaFabImage}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
