import Image from "next/image";
import styles from "@/components/marketing/home/home-hero-cta-button.module.css";
import {
  HOME_HERO_CTA_ASSETS,
  HOME_HERO_CTA_LAYOUT,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { Link } from "@/i18n/navigation";

export type HomeHeroCtaVariant = "booking" | "membership";

export type HomeHeroCtaButtonProps = {
  href: string;
  label: string;
  variant: HomeHeroCtaVariant;
};

/** Figma hero CTAs — Union `196:1430` / `196:1440` with arrow chip. */
export function HomeHeroCtaButton({ href, label, variant }: HomeHeroCtaButtonProps) {
  const assets = HOME_HERO_CTA_ASSETS[variant];
  const layout = HOME_HERO_CTA_LAYOUT[variant];
  return (
    <Link
      href={href}
      className={`${marketingMontserrat.className} ${styles.cta}`}
      style={{
        width: layout.width,
        height: layout.height,
        ["--hero-cta-label-width" as string]: `${layout.labelWidthRatio * 100}%`,
        ["--hero-cta-arrow-zone-width" as string]: `${layout.arrowZoneWidthRatio * 100}%`,
        ["--hero-cta-label-offset" as string]: `${layout.labelOffsetPx}px`,
      }}
    >
      <Image src={assets.shape} alt="" fill unoptimized className={styles.shape} aria-hidden />
      <span className={styles.label}>{label}</span>
      <span className={styles.arrowZone} aria-hidden>
        <Image
          src={assets.arrow}
          alt=""
          width={HOME_HERO_CTA_LAYOUT.arrowWidthPx}
          height={HOME_HERO_CTA_LAYOUT.arrowHeightPx}
          unoptimized
          className={styles.arrow}
        />
      </span>
    </Link>
  );
}
