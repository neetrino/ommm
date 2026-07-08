"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { useHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeHeroSectionShellProps = {
  children: ReactNode;
  promoBannerAriaLabel: string;
  style: CSSProperties;
};

/** Toggles promo-specific section chrome while the founding banner slide is active. */
export function HomeHeroSectionShell({
  children,
  promoBannerAriaLabel,
  style,
}: HomeHeroSectionShellProps) {
  const { isPromoBannerActive } = useHomeHeroSlide();

  return (
    <section
      aria-label={isPromoBannerActive ? promoBannerAriaLabel : undefined}
      aria-labelledby={isPromoBannerActive ? undefined : "home-hero-heading"}
      className={`${marketingMontserrat.variable} ${styles.homeHeroSection} ${isPromoBannerActive ? styles.homeHeroSectionPromo : ""} relative w-full min-w-0`}
      style={style}
    >
      {children}
    </section>
  );
}
