"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  coachCardDisplayName,
  type CoachCardUser,
} from "@/components/coaches/coach-card-display";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { useCoachesPageCardHeightPx } from "@/components/marketing/coaches/coaches-page-card-height-context";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { aboveFoldImageProps } from "@/lib/image-loading-props";
import styles from "@/components/marketing/coaches/coaches-page-coach-card.module.css";

type CoachesPageCoachCardProps = {
  user: CoachCardUser;
  specialization: string | null;
  bio: string | null;
  experienceYears: number | null;
  imageIndex?: number;
  expanded: boolean;
  onToggleExpand: () => void;
};

type ExpandArrowProps = {
  direction: "up" | "down";
};

function ExpandArrow({ direction }: ExpandArrowProps) {
  return (
    <svg
      className={`${styles.expandArrow} ${direction === "up" ? styles.expandArrowUp : styles.expandArrowDown}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 7V17M12 7L7.5 11.5M12 7L16.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ExpandArrowButtonProps = {
  direction: "up" | "down";
  expanded: boolean;
  label: string;
  onPress: () => void;
  variant?: "bar" | "header";
};

function ExpandArrowButton({
  direction,
  expanded,
  label,
  onPress,
  variant = "header",
}: ExpandArrowButtonProps) {
  return (
    <button
      type="button"
      className={variant === "bar" ? styles.expandBarTrigger : styles.expandHeaderTrigger}
      aria-expanded={expanded}
      aria-label={label}
      onClick={onPress}
    >
      <ExpandArrow direction={direction} />
    </button>
  );
}

function cardInsetPercent(valuePx: number, basePx: number): string {
  return `${(valuePx / basePx) * 100}%`;
}

function buildCardStyle(): CSSProperties {
  const card = COACHES_PAGE_CARD;
  const nameFontSize = `clamp(${card.nameFontSizeMinRem}rem, ${card.nameFontSizePreferredVw}vw, ${card.nameFontSizeMaxRem}rem)`;
  return {
    "--coaches-page-card-surface": card.surface,
    "--coaches-page-card-surface-hover": card.surfaceHover,
    "--coaches-page-card-photo-hover-scale": String(card.photoHoverScale),
    "--coaches-page-card-photo-hover-lift": `${card.photoHoverLiftPercent}%`,
    "--coaches-page-card-photo-expand-scale": String(card.photoExpandScale),
    "--coaches-page-card-radius": `${card.radiusPx}px`,
    "--coaches-page-card-name-color": card.nameColor,
    "--coaches-page-card-role-color": card.roleColor,
    "--coaches-page-card-bottom-bar-radius": `${card.bottomBarRadiusPx}px`,
    "--coaches-page-card-bottom-bar-height": `${card.bottomBarHeightPx}px`,
    "--coaches-page-card-expand-panel-height": `${card.expandPanelMinHeightPx}px`,
    "--coaches-page-card-expand-panel-padding": `${card.expandPanelPaddingPx}px`,
    "--coaches-page-card-expand-trigger-inset": `${card.expandTriggerInsetPx}px`,
    "--coaches-page-card-expand-arrow-size": `${card.expandArrowSizePx}px`,
    "--coaches-page-card-glass-blur": `${card.expandPanelGlassBlurPx}px`,
    "--coaches-page-card-glass-blur-expanded": `${card.expandPanelGlassBlurExpandedPx}px`,
    "--coaches-page-card-bottom-bar-fill": card.bottomBarFill,
    "--coaches-page-card-expand-glass-fill-expanded": card.expandPanelGlassFillExpanded,
    "--coaches-page-card-expand-glass-border": card.expandPanelGlassBorder,
    "--coaches-page-card-expand-bio-color": card.expandBioColor,
    "--coaches-page-card-name-top": cardInsetPercent(card.nameInsetTopPx, card.designHeightPx),
    "--coaches-page-card-name-left": cardInsetPercent(card.nameInsetLeftPx, card.designWidthPx),
    "--coaches-page-card-photo-top": cardInsetPercent(card.photoInsetTopPx, card.designHeightPx),
    "--coaches-page-card-photo-left": cardInsetPercent(card.photoInsetLeftPx, card.designWidthPx),
    "--coaches-page-card-name-font-size": nameFontSize,
    "--coaches-page-card-name-max-lines": String(card.nameMaxLines),
  } as CSSProperties;
}

function ExpandPanelBody({ children }: { children: ReactNode }) {
  return <div className={styles.expandPanelBody}>{children}</div>;
}

function collapseHoverLockMs(): number {
  if (typeof window === "undefined") {
    return COACHES_PAGE_CARD.photoCollapseHoverLockMs;
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducedMotion ? 0 : COACHES_PAGE_CARD.photoCollapseHoverLockMs;
}

export function CoachesPageCoachCard({
  user,
  specialization,
  bio,
  experienceYears,
  imageIndex = 0,
  expanded,
  onToggleExpand,
}: CoachesPageCoachCardProps) {
  const t = useTranslations("marketing");
  const displayName = coachCardDisplayName(user);
  const roleLine =
    specialization?.trim() ||
    t("coachesModalSpecializationLabel");
  const imageSrc = user.avatarUrl ?? HOME_SECTION_ASSETS.coachPortrait;
  const experienceText =
    experienceYears != null && experienceYears > 0
      ? t("coachesExperience", { years: experienceYears })
      : null;
  const bioText = bio?.trim() || t("coachesModalBioFallback");
  const expandLabel = t("coachesCardExpandAria", { name: displayName });
  const collapseLabel = t("coachesCardCollapseAria", { name: displayName });
  const toggleLabel = expanded ? collapseLabel : expandLabel;
  const [photoHoverSuppressed, setPhotoHoverSuppressed] = useState(false);
  const wasExpandedRef = useRef(expanded);
  const heightPx = useCoachesPageCardHeightPx();

  const aspectStyle =
    heightPx != null ? ({ height: `${heightPx}px` } as CSSProperties) : undefined;

  useEffect(() => {
    const wasExpanded = wasExpandedRef.current;
    wasExpandedRef.current = expanded;

    if (!wasExpanded || expanded) {
      return;
    }

    setPhotoHoverSuppressed(true);
    const lockMs = collapseHoverLockMs();
    if (lockMs === 0) {
      setPhotoHoverSuppressed(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setPhotoHoverSuppressed(false);
    }, lockMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [expanded]);

  return (
    <article
      className={`${marketingMontserrat.variable} ${styles.card} ${expanded ? styles.cardExpanded : ""} ${photoHoverSuppressed ? styles.cardPhotoHoverSuppressed : ""}`}
      style={buildCardStyle()}
    >
      <div
        className={styles.cardAspect}
        data-sized={heightPx != null ? "true" : undefined}
        style={aspectStyle}
      >
        <div className={styles.cardStage}>
          <div className={styles.cardSurface} aria-hidden />

          <div className={styles.photoWrap} aria-hidden>
            <div className={styles.photoInner}>
              <div className={styles.photoFrame}>
                <div className={styles.photoCrop}>
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 768px) 42vw, 88vw"
                    className="object-cover"
                    style={{ objectPosition: "42% 18%" }}
                    {...aboveFoldImageProps()}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.header}>
            <p className={styles.name}>{displayName}</p>
            <p className={styles.role}>{roleLine}</p>
          </div>

          <div
            className={`${styles.expandPanel} ${expanded ? styles.expandPanelExpanded : styles.expandPanelCollapsed}`}
          >
            <span aria-hidden className={styles.expandPanelBackdrop} />
            <span aria-hidden className={styles.expandPanelGlassRadial} />
            <span aria-hidden className={styles.expandPanelGlassLinear} />
            <span aria-hidden className={styles.expandPanelGlassBorder} />
            <ExpandPanelBody>
              {expanded ? (
                <>
                  <div className={styles.expandHeader}>
                    {experienceText ? (
                      <p className={styles.experience}>{experienceText}</p>
                    ) : (
                      <span aria-hidden />
                    )}
                    <ExpandArrowButton
                      direction="down"
                      expanded={expanded}
                      label={toggleLabel}
                      onPress={onToggleExpand}
                    />
                  </div>
                  <p className={styles.bio}>{bioText}</p>
                </>
              ) : (
                <ExpandArrowButton
                  direction="up"
                  expanded={expanded}
                  label={toggleLabel}
                  onPress={onToggleExpand}
                  variant="bar"
                />
              )}
            </ExpandPanelBody>
          </div>
        </div>
      </div>
    </article>
  );
}
