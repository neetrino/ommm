"use client";

import { useTranslations } from "next-intl";
import { HomeGalleryMosaicCarousel } from "@/components/marketing/home/home-gallery-mosaic-carousel";
import {
  HOME_GALLERY_FIGMA,
  HOME_GALLERY_LAYOUT,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

/**
 * Figma **Gallery** `196:1162` — heading `196:1187`, mosaic `196:1163`, CTA `196:1179`.
 */
export function MarketingPublicHomeGallerySection() {
  const t = useTranslations("marketingPublic.home");

  return (
    <section
      className={`${marketingMontserrat.variable} w-full px-4 sm:px-6 md:px-10 lg:px-20`}
      style={{
        background: HOME_GALLERY_FIGMA.sectionBackground,
        paddingTop: HOME_GALLERY_LAYOUT.sectionPaddingTop,
        paddingBottom: HOME_GALLERY_LAYOUT.sectionPaddingBottom,
      }}
    >
      <div className="mx-auto flex w-full max-w-[min(82.375rem,calc(100%-2rem))] flex-col items-center">
        <header
          className="flex w-full max-w-[834px] flex-col items-center text-center"
          style={{ gap: HOME_GALLERY_LAYOUT.headerGapPx }}
        >
          <h2
            className="font-serif font-semibold tracking-tight text-balance"
            style={{
              color: HOME_GALLERY_FIGMA.headingColor,
              fontSize: HOME_GALLERY_LAYOUT.titleFontSize,
              lineHeight: HOME_GALLERY_LAYOUT.titleLineHeight,
            }}
          >
            {t("galleryTitle")}
          </h2>
          <p
            className={`${marketingMontserrat.className} text-base font-normal leading-[25.6px] tracking-[0.01em]`}
            style={{
              color: HOME_GALLERY_FIGMA.subtitleColor,
              maxWidth: HOME_GALLERY_LAYOUT.subtitleMaxWidth,
            }}
          >
            {t("gallerySubtitle")}
          </p>
        </header>

        <div style={{ marginTop: HOME_GALLERY_LAYOUT.headerToMosaicGapPx, width: "100%" }}>
          <HomeGalleryMosaicCarousel
            prevLabel={t("galleryPrevAria")}
            nextLabel={t("galleryNextAria")}
            getGoToSlideAria={(index) => t("galleryGoToSlideAria", { slide: index + 1 })}
          />
        </div>

        <div style={{ marginTop: HOME_GALLERY_LAYOUT.dotsToCtaGapPx }}>
          <HomeHeroCtaButton
            href="/explore"
            label={t("galleryMoreDetails")}
            variant="membership"
          />
        </div>
      </div>
    </section>
  );
}
