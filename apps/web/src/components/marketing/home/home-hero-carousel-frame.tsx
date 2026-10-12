import type { ReactNode } from "react";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

type HomeHeroCarouselFrameProps = {
  children: ReactNode;
};

/** Shared frame for the intro video and legacy photo slides. */
export function HomeHeroCarouselFrame({ children }: HomeHeroCarouselFrameProps) {
  return <div className={`${styles.homeHeroFrame} relative w-full min-w-0`}>{children}</div>;
}
