"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { MarketingGlassCircleButton } from "@/components/marketing/home/marketing-glass-circle-button";
import {
  HOME_COACHES_SECTION_BACKGROUND,
  HOME_COACHES_SECTION_FIGMA,
  HOME_COACHES_SECTION_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-coaches-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-coaches-section.module.css";
import {
  FeaturedCoachesCarouselStrip,
  type CoachSlideCopy,
} from "@/components/marketing/home/marketing-public-home-coaches-carousel";
import { FeaturedCoachesMobileCarouselStrip } from "@/components/marketing/home/marketing-public-home-coaches-mobile-carousel";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

const FEATURED_COACHES_AUTO_ADVANCE_MS = 5000;

/** Slightly tighter than `py-16` bottom — space above the section title. */
const FEATURED_COACHES_SECTION_PADDING_TOP = "calc(4rem - 55px)";

/**
 * Figma Featured Coaches — desktop `155:188` (unchanged), mobile container `97:5826`.
 */
export function MarketingPublicHomeCoachesSection({
  slides,
}: {
  slides: CoachSlideCopy[];
}) {
  const t = useTranslations("marketingPublic.home");
  const slideCount = slides.length;
  const lastIndex = Math.max(0, slideCount - 1);

  const [activeRaw, setActiveRaw] = useState(0);
  const active = Math.min(activeRaw, lastIndex);

  const setActive = useCallback(
    (index: number) => {
      setActiveRaw(Math.min(Math.max(0, index), lastIndex));
    },
    [lastIndex],
  );

  const goPrev = useCallback(() => {
    if (slideCount <= 0) return;
    setActiveRaw((prev) => {
      const clamped = Math.min(prev, lastIndex);
      return (clamped - 1 + slideCount) % slideCount;
    });
  }, [lastIndex, slideCount]);

  const goNext = useCallback(() => {
    if (slideCount <= 0) return;
    setActiveRaw((prev) => {
      const clamped = Math.min(prev, lastIndex);
      return (clamped + 1) % slideCount;
    });
  }, [lastIndex, slideCount]);

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const clearIntervalIfSet = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const armInterval = () => {
      clearIntervalIfSet();
      if (motionMq.matches) {
        return;
      }
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          goNext();
        }
      }, FEATURED_COACHES_AUTO_ADVANCE_MS);
    };

    armInterval();
    motionMq.addEventListener("change", armInterval);
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        clearIntervalIfSet();
      } else {
        armInterval();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      motionMq.removeEventListener("change", armInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearIntervalIfSet();
    };
  }, [active, goNext, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  const carouselProps = {
    slides,
    active,
    onSelectSlide: setActive,
    goPrev,
    goNext,
    getGoToSlideAria: (name: string) => t("coachesGoToSlideAria", { name }),
  };

  const mobileStyle = {
    ["--home-coaches-section-bg" as string]: HOME_COACHES_SECTION_BACKGROUND,
    ["--home-coaches-section-pt" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionPaddingTop,
    ["--home-coaches-section-pb" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionPaddingBottom,
    ["--home-coaches-section-px" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionPaddingX,
    ["--home-coaches-section-gap" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionGap,
    ["--home-coaches-section-bottom-radius" as string]:
      HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionBottomRadius,
    ["--home-coaches-heading-color" as string]: HOME_COACHES_SECTION_FIGMA.headingColor,
    ["--home-coaches-subtitle-color" as string]: HOME_COACHES_SECTION_FIGMA.subtitleColor,
    ["--home-coaches-title-size" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.titleFontSize,
    ["--home-coaches-title-line-height" as string]: String(
      HOME_COACHES_SECTION_MOBILE_LAYOUT.titleLineHeight,
    ),
    ["--home-coaches-subtitle-size" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.subtitleFontSize,
    ["--home-coaches-subtitle-line-height" as string]: String(
      HOME_COACHES_SECTION_MOBILE_LAYOUT.subtitleLineHeight,
    ),
    ["--home-coaches-subtitle-max-width" as string]:
      HOME_COACHES_SECTION_MOBILE_LAYOUT.subtitleMaxWidth,
    ["--home-coaches-header-subtitle-gap" as string]:
      HOME_COACHES_SECTION_MOBILE_LAYOUT.headerSubtitleGap,
    ["--home-coaches-dot-size" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionDotSize,
    ["--home-coaches-dot-gap" as string]: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionDotGap,
    ["--home-coaches-dot-active-scale" as string]: String(
      HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionDotActiveScale,
    ),
  };

  return (
    <>
      <section
        aria-labelledby="home-coaches-heading-mobile"
        className={`${marketingMontserrat.variable} ${styles.mobileSection}`}
        style={mobileStyle}
      >
        <div className={styles.mobileShell}>
          <header className={styles.mobileHeader}>
            <h2
              id="home-coaches-heading-mobile"
              className={`${styles.mobileTitle} font-serif font-semibold tracking-tight text-balance`}
            >
              {t("coachesTitle")}
            </h2>
          </header>

          <div className={styles.mobileCarouselWrap}>
            <FeaturedCoachesMobileCarouselStrip {...carouselProps} />
          </div>

          {slideCount > 1 ? (
            <div className={styles.mobileNav} aria-label={t("coachesTitle")}>
              <MarketingGlassCircleButton
                arrow="prev"
                label={t("coachesPrevAria")}
                onPress={goPrev}
                size="coachCardInline"
              />
              <div className={styles.mobileDots} role="tablist" aria-label={t("coachesTitle")}>
                {slides.map((slide, index) => (
                  <button
                    key={`coach-mobile-dot-${index}-${slide.name}`}
                    type="button"
                    role="tab"
                    aria-selected={active === index}
                    aria-label={t("coachesGoToSlideAria", { name: slide.name })}
                    className={
                      active === index ? `${styles.mobileDot} ${styles.mobileDotActive}` : styles.mobileDot
                    }
                    onClick={() => {
                      setActive(index);
                    }}
                  />
                ))}
              </div>
              <MarketingGlassCircleButton
                arrow="next"
                label={t("coachesNextAria")}
                onPress={goNext}
                size="coachCardInline"
              />
            </div>
          ) : null}

          <div className={styles.mobileCta}>
            <HomeHeroCtaButton
              href="/coaches"
              label={t("coachesMoreDetails")}
              variant="booking"
              labelOffsetPx={HOME_COACHES_SECTION_MOBILE_LAYOUT.ctaLabelOffsetPx}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-coaches-heading"
        className={`${marketingMontserrat.variable} ${styles.desktopSection} w-full pb-16`}
        style={{
          background: HOME_COACHES_SECTION_BACKGROUND,
          paddingTop: FEATURED_COACHES_SECTION_PADDING_TOP,
        }}
      >
        <div className="mx-auto max-w-[min(80rem,calc(100%-2rem))] px-4 sm:px-6 md:px-10 tablet:px-20">
          <h2
            id="home-coaches-heading"
            className="text-center font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[1.05] text-[#fbf5d5]"
          >
            {t("coachesTitle")}
          </h2>
        </div>

        <div className="w-full overflow-x-clip">
          <FeaturedCoachesCarouselStrip
            slides={slides}
            active={active}
            onSelectSlide={setActive}
            goPrev={goPrev}
            goNext={goNext}
            prevLabel={t("coachesPrevAria")}
            nextLabel={t("coachesNextAria")}
            getGoToSlideAria={(name) => t("coachesGoToSlideAria", { name })}
          />
        </div>

        <div className="mx-auto mt-10 flex max-w-[min(80rem,calc(100%-2rem))] justify-center px-4 sm:px-6 md:px-10 tablet:px-20">
          <HomeHeroCtaButton href="/coaches" label={t("coachesMoreDetails")} variant="coachesDetails" />
        </div>
      </section>
    </>
  );
}
