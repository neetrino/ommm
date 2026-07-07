"use client";

import type { ReactNode } from "react";
import {
  HOME_HERO_CAROUSEL_SLIDES,
  useHomeHeroSlide,
} from "@/components/marketing/home/home-hero-slide-context";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import promoStyles from "@/components/marketing/home/home-hero-promo-content-layer.module.css";

type HomeHeroPromoSlideTrackProps = {
  children: ReactNode;
};

/** Promo copy rides the same carousel transform as the banner image. */
export function HomeHeroPromoSlideTrack({ children }: HomeHeroPromoSlideTrackProps) {
  const { activeSlideIndex, trackOffset } = useHomeHeroSlide();

  return (
    <div className={styles.homeHeroPromoSlideTrack}>
      <div
        className={styles.homeHeroMediaTrack}
        style={{ ["--home-hero-track-offset" as string]: trackOffset }}
      >
        {HOME_HERO_CAROUSEL_SLIDES.map((carouselSlide, index) => (
          <div key={`hero-promo-slide-${index}`} className={styles.homeHeroMediaSlide}>
            {carouselSlide.kind === "promo-banner" ? (
              <div
                className={promoStyles.promoContentLayer}
                aria-hidden={activeSlideIndex !== index}
              >
                <div className={promoStyles.promoContentInner}>{children}</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
