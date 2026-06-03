"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  coachCardDisplayName,
  type CoachCardUser,
} from "@/components/coaches/coach-card-display";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { firstRowGridImageProps } from "@/lib/image-loading-props";
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
  return {
    "--coaches-page-card-surface": card.surface,
    "--coaches-page-card-radius": `${card.radiusPx}px`,
    "--coaches-page-card-name-color": card.nameColor,
    "--coaches-page-card-role-color": card.roleColor,
    "--coaches-page-card-bottom-bar-radius": `${card.bottomBarRadiusPx}px`,
    "--coaches-page-card-bottom-bar-height": `${card.bottomBarHeightPx}px`,
    "--coaches-page-card-design-height": `${card.designHeightPx}px`,
    "--coaches-page-card-expand-panel-height": `${card.expandPanelMinHeightPx}px`,
    "--coaches-page-card-expand-panel-padding": `${card.expandPanelPaddingPx}px`,
    "--coaches-page-card-expand-trigger-inset": `${card.expandTriggerInsetPx}px`,
    "--coaches-page-card-expand-glass-blur": `${card.expandPanelGlassBlurPx}px`,
    "--coaches-page-card-expand-glass-blur-expanded": `${card.expandPanelGlassBlurExpandedPx}px`,
    "--coaches-page-card-expand-glass-saturate": `${card.expandPanelGlassSaturatePercent}%`,
    "--coaches-page-card-expand-glass-fill": card.expandPanelGlassFill,
    "--coaches-page-card-expand-glass-fill-expanded": card.expandPanelGlassFillExpanded,
    "--coaches-page-card-expand-glass-border": card.expandPanelGlassBorder,
    "--coaches-page-card-expand-bio-color": card.expandBioColor,
    "--coaches-page-card-name-top": cardInsetPercent(card.nameInsetTopPx, card.designHeightPx),
    "--coaches-page-card-name-left": cardInsetPercent(card.nameInsetLeftPx, card.designWidthPx),
    "--coaches-page-card-photo-top": cardInsetPercent(card.photoInsetTopPx, card.designHeightPx),
    "--coaches-page-card-photo-left": cardInsetPercent(card.photoInsetLeftPx, card.designWidthPx),
  } as CSSProperties;
}

function ExpandPanelBody({ children }: { children: ReactNode }) {
  return <div className={styles.expandPanelBody}>{children}</div>;
}

type CoachCardPortraitBlurSourceProps = {
  imageSrc: string;
  imageIndex: number;
};

/** Real blur layer — iOS Safari often ignores backdrop-filter behind clipped siblings. */
function CoachCardPortraitBlurSource({
  imageSrc,
  imageIndex,
}: CoachCardPortraitBlurSourceProps) {
  return (
    <div className={styles.photoWrapBlurSource} aria-hidden>
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
              {...firstRowGridImageProps(imageIndex)}
            />
          </div>
        </div>
      </div>
    </div>
  );
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

  return (
    <article
      className={`${marketingMontserrat.variable} ${styles.card} ${expanded ? styles.cardExpanded : ""}`}
      style={buildCardStyle()}
    >
      <div className={styles.cardSurface} aria-hidden />

      <div className={styles.cardMedia}>
        <div className={styles.header}>
          <p className={styles.name}>{displayName}</p>
          <p className={styles.role}>{roleLine}</p>
        </div>

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
                  {...firstRowGridImageProps(imageIndex)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CoachCardPortraitBlurSource imageSrc={imageSrc} imageIndex={imageIndex} />

      <div
        className={`${styles.expandPanel} ${expanded ? styles.expandPanelExpanded : styles.expandPanelCollapsed}`}
      >
        <span aria-hidden className={styles.expandPanelBackdrop} />
        <span aria-hidden className={styles.expandPanelGlassBorder} />
        <span aria-hidden className={styles.expandPanelGlassGloss} />
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
    </article>
  );
}
