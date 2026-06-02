"use client";

import type { CSSProperties } from "react";
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
  imageIndex?: number;
  onClick: () => void;
};

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
    "--coaches-page-card-bottom-bar-fill": card.bottomBarFill,
    "--coaches-page-card-bottom-bar-radius": `${card.bottomBarRadiusPx}px`,
    "--coaches-page-card-bottom-bar-height": `${card.bottomBarHeightPx}px`,
    "--coaches-page-card-design-height": `${card.designHeightPx}px`,
    "--coaches-page-card-name-top": cardInsetPercent(card.nameInsetTopPx, card.designHeightPx),
    "--coaches-page-card-name-left": cardInsetPercent(card.nameInsetLeftPx, card.designWidthPx),
    "--coaches-page-card-photo-top": cardInsetPercent(card.photoInsetTopPx, card.designHeightPx),
    "--coaches-page-card-photo-left": cardInsetPercent(card.photoInsetLeftPx, card.designWidthPx),
  } as CSSProperties;
}

const CARD_STYLE = buildCardStyle();

export function CoachesPageCoachCard({
  user,
  specialization,
  imageIndex = 0,
  onClick,
}: CoachesPageCoachCardProps) {
  const t = useTranslations("marketing");
  const displayName = coachCardDisplayName(user);
  const roleLine =
    specialization?.trim() ||
    t("coachesModalSpecializationLabel");
  const imageSrc = user.avatarUrl ?? HOME_SECTION_ASSETS.coachPortrait;

  return (
    <button
      type="button"
      className={`${marketingMontserrat.variable} ${styles.card}`}
      style={CARD_STYLE}
      aria-label={t("coachesOpenCardAria", { name: displayName })}
      onClick={onClick}
    >
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

      <div className={styles.bottomBar} aria-hidden>
        <Image
          src={HOME_SECTION_ASSETS.coachesCtaArrow}
          alt=""
          width={23}
          height={23}
          className={styles.expandIcon}
          aria-hidden
        />
      </div>
    </button>
  );
}
