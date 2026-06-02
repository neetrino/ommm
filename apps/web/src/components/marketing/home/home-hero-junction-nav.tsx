"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "@/components/marketing/home/home-hero-junction-nav.module.css";
import {
  HOME_HERO_JUNCTION_NAV_ASSETS,
  HOME_HERO_JUNCTION_NAV_FIGMA,
  HOME_HERO_JUNCTION_NAV_LAYOUT,
  HOME_HERO_JUNCTION_NAV_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-hero-junction-nav-tokens";

/** Figma hero ↔ schedule seam controls `196:1455` — hero photo carousel wiring comes later. */
export function HomeHeroJunctionNav() {
  const t = useTranslations("marketingPublic.hero");

  return (
    <nav
      className={styles.junctionNav}
      aria-label={t("junctionNavAria")}
      style={{
        ["--home-hero-junction-bottom" as string]: HOME_HERO_JUNCTION_NAV_MOBILE_LAYOUT.bottomOffset,
        ["--home-hero-junction-bottom-lg" as string]: HOME_HERO_JUNCTION_NAV_LAYOUT.bottomOffset,
        ["--home-hero-junction-button-size" as string]:
          HOME_HERO_JUNCTION_NAV_MOBILE_LAYOUT.buttonSize,
        ["--home-hero-junction-button-size-lg" as string]: HOME_HERO_JUNCTION_NAV_LAYOUT.buttonSize,
        ["--home-hero-junction-gap" as string]: HOME_HERO_JUNCTION_NAV_MOBILE_LAYOUT.buttonGap,
        ["--home-hero-junction-gap-lg" as string]: HOME_HERO_JUNCTION_NAV_LAYOUT.buttonGap,
        ["--home-hero-junction-button-fill" as string]: HOME_HERO_JUNCTION_NAV_FIGMA.buttonFill,
      }}
    >
      <button
        type="button"
        className={styles.button}
        aria-label={t("junctionNavPrevAria")}
        disabled
      >
        <Image
          src={HOME_HERO_JUNCTION_NAV_ASSETS.arrow}
          alt=""
          width={HOME_HERO_JUNCTION_NAV_FIGMA.buttonSizePx}
          height={HOME_HERO_JUNCTION_NAV_FIGMA.buttonSizePx}
          unoptimized
          className={`${styles.icon} ${styles.iconUp}`}
        />
      </button>
      <button
        type="button"
        className={styles.button}
        aria-label={t("junctionNavNextAria")}
        disabled
      >
        <Image
          src={HOME_HERO_JUNCTION_NAV_ASSETS.arrow}
          alt=""
          width={HOME_HERO_JUNCTION_NAV_FIGMA.buttonSizePx}
          height={HOME_HERO_JUNCTION_NAV_FIGMA.buttonSizePx}
          unoptimized
          className={`${styles.icon} ${styles.iconDown}`}
        />
      </button>
    </nav>
  );
}
