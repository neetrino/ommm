"use client";

import type { ReactNode } from "react";
import { HOME_HERO_PROMO_BANNER_LAYOUT } from "@/components/marketing/home/home-hero-banner-tokens";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { useHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";

type HomeHeroCarouselFrameProps = {
  children: ReactNode;
};

/** Promo frame height follows banner aspect ratio — image only, no extra bands. */
export function HomeHeroCarouselFrame({ children }: HomeHeroCarouselFrameProps) {
  const { isPromoBannerActive } = useHomeHeroSlide();

  return (
    <div
      className={`${styles.homeHeroFrame} ${isPromoBannerActive ? styles.homeHeroFramePromo : ""} relative w-full min-w-0`}
      style={
        isPromoBannerActive
          ? {
              ["--home-hero-promo-aspect-ratio" as string]:
                HOME_HERO_PROMO_BANNER_LAYOUT.aspectRatio,
            }
          : undefined
      }
    >
      {isPromoBannerActive ? (
        <div className={styles.homeHeroPromoAspectSpacer} aria-hidden />
      ) : (
        children
      )}
    </div>
  );
}
