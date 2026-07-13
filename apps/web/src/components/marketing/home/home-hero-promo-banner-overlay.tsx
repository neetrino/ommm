"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT,
  HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX,
  HOME_HERO_PROMO_CTA_PHONE,
  HOME_HERO_PROMO_CTA_PILL,
} from "@/components/marketing/home/home-hero-banner-tokens";
import styles from "@/components/marketing/home/home-hero-promo-banner-overlay.module.css";
import { formatPhoneTelHref } from "@/lib/phone";

export type HomeHeroPromoBannerOverlayProps = {
  foundingLine1: string;
  foundingLine2: string;
  areOpen: string;
  limitedLine1: string;
  limitedLine2Prefix: string;
  limitedLine2Emphasis: string;
  ctaAriaLabel: string;
};

type PromoHeadlineLayout = {
  topPx: number;
  heightPx: number;
  fontSizePx: number;
  foundingLineHeightPx: number;
  areOpenLineHeightPx: number;
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
  headline: PromoHeadlineLayout,
  limited: PromoTextBlockLayout,
  ctaBadge?: PromoCtaBadgeLayout,
): CSSProperties {
  return {
    ["--home-hero-promo-artboard-width" as string]: String(artboardWidthPx),
    ["--home-hero-promo-artboard-height" as string]: String(artboardHeightPx),
    ["--home-hero-promo-text-shift-up-px" as string]: String(shiftUpPx),
    ["--home-hero-promo-text-color" as string]: HOME_HERO_PROMO_BANNER_TEXT_FIGMA.textColor,
    ["--home-hero-promo-headline-top-px" as string]: String(headline.topPx),
    ["--home-hero-promo-headline-height-px" as string]: String(headline.heightPx),
    ["--home-hero-promo-headline-size-px" as string]: String(headline.fontSizePx),
    ["--home-hero-promo-headline-founding-line-height-px" as string]: String(
      headline.foundingLineHeightPx,
    ),
    ["--home-hero-promo-headline-are-open-line-height-px" as string]: String(
      headline.areOpenLineHeightPx,
    ),
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
          ["--home-hero-promo-cta-phone-size-px" as string]: String(
            Math.round(
              ctaBadge.heightPx *
                HOME_HERO_PROMO_CTA_PILL.displayScale *
                HOME_HERO_PROMO_CTA_PHONE.fontSizeHeightRatio,
            ),
          ),
        }
      : {}),
  };
}

const DESKTOP_TEXT_STYLE = buildPromoTextStyleVars(
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.desktopArtboardWidthPx,
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.desktopArtboardHeightPx,
  HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX.desktop,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopHeadline,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopLimited,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.desktopCtaBadge,
);

const MOBILE_TEXT_STYLE = buildPromoTextStyleVars(
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.mobileArtboardWidthPx,
  HOME_HERO_PROMO_BANNER_TEXT_FIGMA.mobileArtboardHeightPx,
  HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX.mobile,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileHeadline,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileLimited,
  HOME_HERO_PROMO_BANNER_TEXT_LAYOUT.mobileCtaBadge,
);

const PROMO_CTA_PILL_WIDTH_PX = HOME_HERO_PROMO_CTA_PILL.widthPx;
const PROMO_CTA_PILL_HEIGHT_PX = HOME_HERO_PROMO_CTA_PILL.heightPx;

const PROMO_CTA_PHONE_STYLE: CSSProperties = {
  ["--home-hero-promo-cta-phone-color" as string]: HOME_HERO_PROMO_CTA_PHONE.color,
  ["--home-hero-promo-cta-phone-disc-width-ratio" as string]: String(
    HOME_HERO_PROMO_CTA_PHONE.discWidthRatio,
  ),
  ["--home-hero-promo-cta-phone-offset-right-px" as string]: String(
    HOME_HERO_PROMO_CTA_PHONE.offsetRightPx,
  ),
  ["--home-hero-promo-cta-pill-aspect-ratio" as string]: String(
    HOME_HERO_PROMO_CTA_PILL.aspectRatio,
  ),
  ["--home-hero-promo-cta-pill-scale" as string]: String(HOME_HERO_PROMO_CTA_PILL.displayScale),
};

function PromoBannerCopy({
  foundingLine1,
  foundingLine2,
  areOpen,
  limitedLine1,
  limitedLine2Prefix,
  limitedLine2Emphasis,
  ctaAriaLabel,
  isDesktop,
  style,
}: HomeHeroPromoBannerOverlayProps & {
  isDesktop: boolean;
  style: CSSProperties;
}) {
  const ctaTelHref = formatPhoneTelHref(HOME_HERO_PROMO_CTA_PHONE.tel);

  return (
    <div className={isDesktop ? styles.desktopOnly : styles.mobileOnly} style={style}>
      <div className={`${styles.textBlock} ${styles.headlineBlock}`}>
        <p className={styles.headlineLine}>{foundingLine1}</p>
        <p className={styles.headlineLine}>{foundingLine2}</p>
        <p className={styles.headlineLineAreOpen}>{areOpen}</p>
      </div>
      <div className={`${styles.textBlock} ${styles.limitedBlock}`}>
        <p className={styles.limitedLine}>{limitedLine1}</p>
        <p className={styles.limitedLine}>
          {limitedLine2Prefix}
          <span className={styles.limitedEmphasis}>{limitedLine2Emphasis}</span>
        </p>
      </div>
      <a
        href={`tel:${ctaTelHref}`}
        className={styles.ctaBadge}
        aria-label={ctaAriaLabel}
        style={PROMO_CTA_PHONE_STYLE}
      >
        <Image
          src={HOME_HERO_ASSETS.promoBannerCtaPill}
          alt=""
          width={PROMO_CTA_PILL_WIDTH_PX}
          height={PROMO_CTA_PILL_HEIGHT_PX}
          priority
          draggable={false}
          className={styles.ctaPillImage}
        />
        <span className={styles.ctaPhoneNumber} aria-hidden="true">
          {HOME_HERO_PROMO_CTA_PHONE.display}
        </span>
      </a>
    </div>
  );
}

/** Live promo copy over the founding banner slide — Figma `881:802` / `882:802`. */
export function HomeHeroPromoBannerOverlay(props: HomeHeroPromoBannerOverlayProps) {
  return (
    <div className={styles.overlay}>
      <h2 id="home-hero-promo-heading" className={styles.srOnly}>
        {props.foundingLine1} {props.foundingLine2} {props.areOpen} {props.limitedLine1}.{" "}
        {props.limitedLine2Prefix}
        {props.limitedLine2Emphasis}
      </h2>
      <PromoBannerCopy {...props} isDesktop={false} style={MOBILE_TEXT_STYLE} />
      <PromoBannerCopy {...props} isDesktop={true} style={DESKTOP_TEXT_STYLE} />
    </div>
  );
}
