import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "@/components/marketing/home/home-package-plan-card.module.css";
import {
  HomePackagePlanCardPriceCopy,
  type HomePackagePlanCardProps,
} from "@/components/marketing/home/home-package-plan-card";
import {
  HOME_PLANS_SECTION_ASSETS,
  HOME_PLANS_SECTION_FIGMA,
  HOME_PLANS_SECTION_MOBILE_FIGMA,
} from "@/components/marketing/home/home-plans-section-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { Link } from "@/i18n/navigation";

function figmaCardPercentX(px: number): string {
  return `${(px / HOME_PLANS_SECTION_MOBILE_FIGMA.cardWidthPx) * 100}%`;
}

function figmaCardPercentY(px: number): string {
  return `${(px / HOME_PLANS_SECTION_MOBILE_FIGMA.cardHeightPx) * 100}%`;
}

function mobilePlanCardStyleVars(): CSSProperties {
  const mobile = HOME_PLANS_SECTION_MOBILE_FIGMA;

  return {
    ["--home-plan-card-max-width" as string]: `${mobile.cardWidthPx}px`,
    ["--home-plan-card-aspect-ratio" as string]: `${mobile.cardWidthPx} / ${mobile.cardHeightPx}`,
    ["--home-plan-card-radius" as string]: `${mobile.cardRadiusPx}px`,
    ["--home-plan-card-fallback-bg" as string]: HOME_PLANS_SECTION_FIGMA.cardFallbackBg,
    ["--home-plan-image-frame-left" as string]: `${mobile.cardImageFrameLeftPx}px`,
    ["--home-plan-image-frame-top" as string]: `${mobile.cardImageFrameTopPx}px`,
    ["--home-plan-image-frame-width" as string]: `${mobile.cardImageFrameWidthPx}px`,
    ["--home-plan-image-frame-height" as string]: `${mobile.cardImageFrameHeightPx}px`,
    ["--home-plan-image-crop-left" as string]: `${mobile.cardImageCropLeftPercent}%`,
    ["--home-plan-image-crop-top" as string]: `${mobile.cardImageCropTopPercent}%`,
    ["--home-plan-image-crop-width" as string]: `${mobile.cardImageCropWidthPercent}%`,
    ["--home-plan-image-crop-height" as string]: `${mobile.cardImageCropHeightPercent}%`,
    ["--home-plan-category-left" as string]: figmaCardPercentX(mobile.categoryLeftPx),
    ["--home-plan-category-top" as string]: figmaCardPercentY(mobile.categoryTopPx),
    ["--home-plan-category-size" as string]: `${mobile.categoryFontSizePx}px`,
    ["--home-plan-category-line-height" as string]: `${mobile.categoryLineHeightPx}px`,
    ["--home-plan-glass-width" as string]: `${mobile.glassWidthPx}px`,
    ["--home-plan-glass-height" as string]: `${mobile.glassHeightPx}px`,
    ["--home-plan-glass-min-height" as string]: `${mobile.glassHeightPx}px`,
    ["--home-plan-glass-overhang" as string]: `${mobile.glassOverhangPx}px`,
    ["--home-plan-glass-bottom" as string]: `${mobile.glassBottomInsetPx}px`,
    ["--home-plan-glass-padding" as string]: `0 ${mobile.glassPaddingRightPx}px 0 ${mobile.glassPaddingLeftPx}px`,
    ["--home-plan-details-size" as string]: `${mobile.detailsFontSizePx}px`,
    ["--home-plan-details-line-height" as string]: `${mobile.detailsLineHeightPx}px`,
    ["--home-plan-price-size" as string]: `${mobile.priceFontSizePx}px`,
    ["--home-plan-price-line-height" as string]: `${mobile.priceLineHeightPx}px`,
    ["--home-plan-letter-spacing" as string]: `${mobile.letterSpacingPx}px`,
    ["--home-plan-cta-size" as string]: `${mobile.ctaIconSizePx}px`,
    ["--home-plan-category-color" as string]: HOME_PLANS_SECTION_FIGMA.categoryColor,
    ["--home-plan-price-color" as string]: HOME_PLANS_SECTION_FIGMA.priceColor,
  };
}

/** Mobile package card — desktop glass style, Figma `104:6142` sizes. */
export function HomePackagePlanCardMobile({
  planName,
  details,
  priceAmount,
  priceFromPrefix,
  ctaAria,
}: HomePackagePlanCardProps) {
  return (
    <Link
      href="/packages"
      aria-label={ctaAria}
      className={`${marketingMontserrat.variable} ${styles.card} group`}
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
        <span aria-hidden className={styles.priceGlassBase} />
        <span aria-hidden className={styles.priceGlassRadial} />
        <span aria-hidden className={styles.priceGlassLinear} />
        <span aria-hidden className={styles.priceGlassSweep} />
        <div className={`${marketingMontserrat.className} ${styles.priceGlassContent}`}>
          <HomePackagePlanCardPriceCopy
            details={details}
            priceAmount={priceAmount}
            priceFromPrefix={priceFromPrefix}
          />
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
