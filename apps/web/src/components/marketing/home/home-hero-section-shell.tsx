import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeHeroSectionShellProps = {
  children: ReactNode;
  style: CSSProperties;
};

/** Hero section chrome shared by the intro video and legacy photo slides. */
export function HomeHeroSectionShell({ children, style }: HomeHeroSectionShellProps) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className={`${marketingMontserrat.variable} ${styles.homeHeroSection} relative w-full min-w-0`}
      style={style}
    >
      {children}
    </section>
  );
}
