"use client";

import Image from "next/image";
import styles from "@/components/marketing/home/home-hero-cta-button.module.css";
import {
  HOME_HERO_CTA_ASSETS,
  HOME_HERO_CTA_LAYOUT,
  HOME_HERO_CTA_MEMBERSHIP_LABEL_TYPE,
  HOME_HERO_CTA_TABLET_HERO_LAYOUT,
  HOME_HERO_CTA_TABLET_LAYOUT,
  HOME_HERO_MOBILE_CTA_LAYOUT,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { MarketingSectionLink } from "@/components/marketing/marketing-section-link";
import { aboveFoldImageProps, belowFoldImageProps } from "@/lib/image-loading-props";

export type HomeHeroCtaVariant = "booking" | "membership" | "coachesDetails";

export type HomeHeroCtaButtonProps = {
  href: string;
  label: string;
  variant: HomeHeroCtaVariant;
  /** Hero uses larger iPad Pro sizing than inline section CTAs. */
  sizeContext?: "default" | "hero";
  /** Override mobile label inset (px) — e.g. optical nudge for section-specific CTAs. */
  labelOffsetPx?: number;
};

/** Figma hero CTAs — desktop Union `196:1430` / `196:1440`; mobile `108:6562` / `108:6572`. */
export function HomeHeroCtaButton({
  href,
  label,
  variant,
  sizeContext = "default",
  labelOffsetPx,
}: HomeHeroCtaButtonProps) {
  const assets = HOME_HERO_CTA_ASSETS[variant];
  const desktopLayout = HOME_HERO_CTA_LAYOUT[variant];
  const tabletLayout =
    sizeContext === "hero"
      ? HOME_HERO_CTA_TABLET_HERO_LAYOUT[variant]
      : HOME_HERO_CTA_TABLET_LAYOUT[variant];
  const mobileLayout =
    variant === "booking" || variant === "membership"
      ? HOME_HERO_MOBILE_CTA_LAYOUT[variant]
      : null;
  const isMembershipLikeVariant = variant === "membership" || variant === "coachesDetails";
  const membershipLabelType = isMembershipLikeVariant ? HOME_HERO_CTA_MEMBERSHIP_LABEL_TYPE : null;
  const usesMobileCenteredLabel = mobileLayout !== null;
  const mobileLabelCenteredClass = usesMobileCenteredLabel ? styles.mobileLabelCentered : "";
  const variantClass =
    variant === "booking"
      ? styles.booking
      : variant === "membership"
        ? styles.membership
        : variant === "coachesDetails"
          ? styles.coachesDetails
          : undefined;
  const shapeMobile = "shapeMobile" in assets ? assets.shapeMobile : undefined;
  const arrowMobile = "arrowMobile" in assets ? assets.arrowMobile : undefined;
  const mobileLabelOffsetPx = labelOffsetPx ?? mobileLayout?.labelOffsetPx ?? desktopLayout.labelOffsetPx;
  const imageLoadingProps = sizeContext === "hero" ? aboveFoldImageProps() : belowFoldImageProps();

  return (
    <MarketingSectionLink
      href={href}
      className={`font-sans ${styles.cta} ${variantClass ?? ""} ${mobileLabelCenteredClass}`}
      disabledClassName={`font-sans ${styles.cta} ${variantClass ?? ""} ${mobileLabelCenteredClass} pointer-events-none opacity-60`}
      style={{
        ["--hero-cta-width" as string]: mobileLayout?.width ?? desktopLayout.width,
        ["--hero-cta-width-lg" as string]: desktopLayout.width,
        ["--hero-cta-width-tablet" as string]: tabletLayout.width,
        ["--hero-cta-height" as string]: mobileLayout?.height ?? desktopLayout.height,
        ["--hero-cta-height-lg" as string]: desktopLayout.height,
        ["--hero-cta-height-tablet" as string]: tabletLayout.height,
        ["--hero-cta-label-width" as string]: `${(mobileLayout?.labelWidthRatio ?? desktopLayout.labelWidthRatio) * 100}%`,
        ["--hero-cta-label-width-lg" as string]: `${desktopLayout.labelWidthRatio * 100}%`,
        ["--hero-cta-arrow-zone-width" as string]: `${(mobileLayout?.arrowZoneWidthRatio ?? desktopLayout.arrowZoneWidthRatio) * 100}%`,
        ["--hero-cta-arrow-zone-width-lg" as string]: `${desktopLayout.arrowZoneWidthRatio * 100}%`,
        ["--hero-cta-label-offset" as string]: usesMobileCenteredLabel ? "0px" : `${mobileLabelOffsetPx}px`,
        ["--hero-cta-label-offset-lg" as string]: `${desktopLayout.labelOffsetPx}px`,
        ["--hero-cta-label-font-size" as string]: membershipLabelType
          ? membershipLabelType.mobile
          : mobileLayout !== null
            ? HOME_HERO_MOBILE_CTA_LAYOUT.labelFontSize
            : undefined,
        ["--hero-cta-label-font-size-lg" as string]: membershipLabelType?.desktop,
        ["--hero-cta-label-font-size-tablet" as string]: membershipLabelType?.tablet,
      }}
    >
      {shapeMobile ? (
        <Image
          src={shapeMobile}
          alt=""
          fill
          unoptimized
          className={`${styles.shape} ${styles.shapeMobile}`}
          aria-hidden
          {...imageLoadingProps}
        />
      ) : null}
      <Image
        src={assets.shape}
        alt=""
        fill
        unoptimized
        className={`${styles.shape} ${styles.shapeDesktop}`}
        aria-hidden
        {...imageLoadingProps}
      />
      <span className={styles.label}>{label}</span>
      <span className={styles.arrowZone} aria-hidden>
        {arrowMobile ? (
          <Image
            src={arrowMobile}
            alt=""
            width={HOME_HERO_CTA_LAYOUT.arrowWidthPx}
            height={HOME_HERO_CTA_LAYOUT.arrowHeightPx}
            unoptimized
            className={`${styles.arrow} ${styles.arrowMobile}`}
            {...imageLoadingProps}
          />
        ) : null}
        <Image
          src={assets.arrow}
          alt=""
          width={HOME_HERO_CTA_LAYOUT.arrowWidthPx}
          height={HOME_HERO_CTA_LAYOUT.arrowHeightPx}
          unoptimized
          className={`${styles.arrow} ${styles.arrowDesktop}`}
          {...imageLoadingProps}
        />
      </span>
    </MarketingSectionLink>
  );
}
