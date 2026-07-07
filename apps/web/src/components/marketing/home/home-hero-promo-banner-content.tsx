import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import styles from "@/components/marketing/home/home-hero-promo-content-layer.module.css";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

type HomeHeroPromoBannerContentProps = {
  locale: string;
};

/** Figma `783:800` — founding membership copy (left column). */
export async function HomeHeroPromoBannerContent({ locale }: HomeHeroPromoBannerContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.hero" });

  return (
    <div className={styles.promoContent}>
      <h2 id="home-hero-promo-heading" className={`${styles.promoHeadline} font-serif`}>
        <span className={styles.promoHeadlineLine}>{t("promoBanner3HeadlineLine1")}</span>
        <span className={styles.promoHeadlineLine}>{t("promoBanner3HeadlineLine2")}</span>
        <span className={`${styles.promoHeadlineLine} ${styles.promoHeadlineLineItalic}`}>
          {t("promoBanner3HeadlineLine3")}
        </span>
      </h2>

      <p className={`${styles.promoSubline} font-sans`}>
        <span className={styles.promoSublineLine}>{t("promoBanner3Subline1")}</span>
        <span className={styles.promoSublineLine}>
          {t("promoBanner3Subline2Prefix")}{" "}
          <strong className={styles.promoSublineBold}>{t("promoBanner3Subline2Bold")}</strong>
        </span>
      </p>

      <a className={styles.promoPhonePill} href={`tel:${t("promoBanner3PhoneHref")}`}>
        <span className={styles.promoPhoneEmblem} aria-hidden>
          <span className={styles.promoPhoneEmblemCrop}>
            <Image
              src={HOME_HERO_ASSETS.logoMark}
              alt=""
              fill
              sizes="48px"
              className={styles.promoPhoneEmblemImage}
              {...aboveFoldImageProps()}
            />
          </span>
        </span>
        <span className={`${styles.promoPhoneNumber} font-serif`}>{t("promoBanner3Phone")}</span>
      </a>
    </div>
  );
}
