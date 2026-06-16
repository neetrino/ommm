"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "@/components/marketing/home/home-hero-junction-nav.module.css";
import {
  HOME_HERO_JUNCTION_NAV_ASSETS,
  HOME_HERO_JUNCTION_NAV_FIGMA,
} from "@/components/marketing/home/home-hero-junction-nav-tokens";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

/** Figma hero ↔ schedule seam controls `196:1455` — hero photo carousel wiring comes later. */
export function HomeHeroJunctionNav() {
  const t = useTranslations("marketingPublic.hero");

  return (
    <nav className={styles.junctionNav} aria-label={t("junctionNavAria")}>
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
          {...aboveFoldImageProps()}
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
          {...aboveFoldImageProps()}
        />
      </button>
    </nav>
  );
}
