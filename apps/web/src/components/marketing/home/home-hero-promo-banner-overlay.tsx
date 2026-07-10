"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT,
  HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX,
  HOME_HERO_PROMO_CTA_LOGO_LAYOUT,
  HOME_HERO_PROMO_CTA_LOGO_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-hero-banner-tokens";
import styles from "@/components/marketing/home/home-hero-promo-banner-overlay.module.css";
import { Link } from "@/i18n/navigation";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

export type HomeHeroPromoBannerOverlayProps = {
  foundingLine1: string;
  foundingLine2: string;
  areOpen: string;
  limitedLine1: string;
  limitedLine2Prefix: string;
  limitedLine2Emphasis: string;
  mobileCtaHref: string;
  mobileCtaAriaLabel: string;
  desktopCtaHref: string;
  desktopCtaAriaLabel: string;
};

type PromoTextBlockLayout = {
  topPx: number;
  heightPx: number;
  fontSizePx: number;
  lineHeightPx: number;
  leftPx?: number;
  widthPx?: number;
};

type PromoCtaBadgeLayout = {
  topPx: number;
  widthPx: number;
  heightPx: number;
};

function buildPromoTextStyleVars(
  artboardWidthPx: number,
  artboardHeightPx: number,
  shiftUpPx: number,
  founding: PromoTextBlockLayout,
  areOpen: PromoTextBlockLayout,
  limited: PromoTextBlockLayout,
  ctaBadge?: PromoCtaBadgeLayout,
): CSSProperties {
  return {
    ["--home-hero-promo-artboard-width" as string]: String(artboardWidthPx),
    ["--home-hero-promo-artboard-height" as string]: String(artboardHeightPx),
    ["--home-hero-promo-text-shift-up-px" as string]: String(shiftUpPx),
    ["--home-hero-promo-text-color" as string]: HOME_HERO_PROMO_BANNER_TEXT_FIGMA.textColor,
    ["--home-hero-promo-founding-top-px" as string]: String(founding.topPx),
    ["--home-hero-promo-founding-height-px" as string]: String(founding.heightPx),
    ["--home-hero-promo-founding-size-px" as string]: String(founding.fontSizePx),
    ["--home-hero-promo-founding-line-height-px" as string]: String(founding.lineHeightPx),
    ["--home-hero-promo-are-open-top-px" as string]: String(areOpen.topPx),
    ["--home-hero-promo-are-open-height-px" as string]: String(areOpen.heightPx),
    ["--home-hero-promo-are-open-size-px" as string]: String(areOpen.fontSizePx),
    ["--home-hero-promo-are-open-line-height-px" as string]: String(areOpen.lineHeightPx),
    ["--home-hero-promo-limited-top-px" as string]: String(limited.topPx),
    ["--home-hero-promo-limited-height-px" as string]: String(limited.heightPx),
    ["--home-hero-promo-limited-width-px" as string]: String(limited.widthPx ?? 0),
    ["--home-hero-promo-limited-size-px" as string]: String(limited.fontSizePx),
    ["--home-hero-promo-limited-line-height-px" as string]: String(limited.lineHeightPx),
    ...(ctaBadge
      ? {
          ["--home-hero-promo-cta-top-px" as string]: String(ctaBadge.topPx),
          ["--home-hero-promo-cta-width-px" as string]: String(ctaBadge.widthPx),
          ["--home-hero-promo-cta-height-px" as string]: String(ctaBadge.heightPx),
        }
      : {}),
  };
}

const DESKTOP_TEXT_STYLE = buildPromoTextStyleVars(
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.desktopArtboardWidthPx,
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.desktopArtboardHeightPx,
  HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX.desktop,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopFounding,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopAreOpen,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopLimited,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopCtaBadge,
);

const MOBILE_TEXT_STYLE = buildPromoTextStyleVars(
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.mobileArtboardWidthPx,
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.mobileArtboardHeightPx,
  HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX.mobile,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileFounding,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileAreOpen,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileLimited,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileCtaBadge,
);

function PromoBannerCopy({
  foundingLine1,
  foundingLine2,
  areOpen,
  limitedLine1,
  limitedLine2Prefix,
  limitedLine2Emphasis,
  mobileCtaHref,
  mobileCtaAriaLabel,
  desktopCtaHref,
  desktopCtaAriaLabel,
  isDesktop,
  style,
}: HomeHeroPromoBannerOverlayProps & {
  isDesktop: boolean;
  style: CSSProperties;
}) {
  const ctaHref = isDesktop ? desktopCtaHref : mobileCtaHref;
  const ctaAriaLabel = isDesktop ? desktopCtaAriaLabel : mobileCtaAriaLabel;
  const ctaAsset = isDesktop
    ? HOME_HERO_ASSETS.promoBannerDesktopCta
    : HOME_HERO_ASSETS.promoBannerMobileCta;
  const ctaLayout = isDesktop
    ? HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopCtaBadge
    : HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileCtaBadge;
  const ctaLogoLayout = isDesktop
    ? HOME_HERO_PROMO_CTA_LOGO_LAYOUT
    : HOME_HERO_PROMO_CTA_LOGO_MOBILE_LAYOUT;

  return (
    <div className={isDesktop ? styles.desktopOnly : styles.mobileOnly} style={style}>
      <div className={`${styles.textBlock} ${styles.foundingBlock}`}>
        <p className={styles.foundingLine}>{foundingLine1}</p>
        <p className={styles.foundingLine}>{foundingLine2}</p>
      </div>
      <div className={`${styles.textBlock} ${styles.areOpenBlock}`}>
        <p className={styles.areOpenLine}>{areOpen}</p>
      </div>
      <div className={`${styles.textBlock} ${styles.limitedBlock}`}>
        <p className={styles.limitedLine}>{limitedLine1}</p>
        <p className={styles.limitedLine}>
          {limitedLine2Prefix}
          <span className={styles.limitedEmphasis}>{limitedLine2Emphasis}</span>
        </p>
      </div>
      <Link
        href={ctaHref}
        className={styles.ctaBadge}
        aria-label={ctaAriaLabel}
        style={{
          ["--home-hero-promo-cta-logo-width-ratio" as string]: String(
            ctaLogoLayout.widthRatio,
          ),
          ["--home-hero-promo-cta-logo-height-ratio" as string]: String(
            ctaLogoLayout.heightRatio,
          ),
          ["--home-hero-promo-cta-logo-top-offset-ratio" as string]: String(
            ctaLogoLayout.topOffsetRatio,
          ),
          ["--home-hero-promo-cta-logo-left-offset-ratio" as string]: String(
            ctaLogoLayout.leftOffsetRatio,
          ),
          ["--home-hero-promo-cta-logo-object-position" as string]:
            ctaLogoLayout.objectPosition,
        }}
      >
        <Image
          src={ctaAsset}
          alt=""
          width={ctaLayout.widthPx}
          height={ctaLayout.heightPx}
          unoptimized
          className={styles.ctaImage}
          {...aboveFoldImageProps()}
        />
        <span className={styles.ctaLogoDisc} aria-hidden="true">
          <Image
            src={HOME_HERO_ASSETS.logoMark}
            alt=""
            fill
            unoptimized
            sizes={`${Math.round(ctaLayout.heightPx)}px`}
            className={styles.ctaLogoImage}
            {...aboveFoldImageProps()}
          />
        </span>
      </Link>
    </div>
  );
}

/** Live promo copy over the founding banner slide — Figma `881:802` / `882:802`. */
export function HomeHeroPromoBannerOverlay(props: HomeHeroPromoBannerOverlayProps) {
  return (
    <div className={styles.overlay}>
      <h2 id="home-hero-promo-heading" className={styles.srOnly}>
        {props.foundingLine1} {props.foundingLine2}. {props.areOpen}. {props.limitedLine1}.{" "}
        {props.limitedLine2Prefix}
        {props.limitedLine2Emphasis}
      </h2>
      <PromoBannerCopy {...props} isDesktop={false} style={MOBILE_TEXT_STYLE} />
      <PromoBannerCopy {...props} isDesktop={true} style={DESKTOP_TEXT_STYLE} />
    </div>
  );
}
