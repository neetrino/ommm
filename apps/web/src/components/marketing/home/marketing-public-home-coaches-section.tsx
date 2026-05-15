"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import {
  CoachesPagination,
  FeaturedCoachesCarouselStrip,
  type CoachSlideCopy,
} from "@/components/marketing/home/marketing-public-home-coaches-carousel";

/**
 * Figma **Featured Coaches** `155:188` — carousel card **Frame 68** `163:879`, portrait `163:878`.
 */
export function MarketingPublicHomeCoachesSection() {
  const t = useTranslations("marketingPublic.home");
  const slides = t.raw("coachSlides") as CoachSlideCopy[];
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

  if (slideCount === 0) {
    return null;
  }

  return (
    <section
      className={`${marketingMontserrat.variable} w-full px-4 py-16 sm:px-6 md:px-10 lg:px-20`}
      style={{
        background: `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.coachesGradientFrom}, ${HOME_PAGE_SURFACE.coachesGradientTo})`,
      }}
    >
      <div className="mx-auto max-w-[min(80rem,calc(100%-2rem))]">
        <h2 className="text-center font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[1.05] text-[#fbf5d5]">
          {t("coachesTitle")}
        </h2>

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

        <div className="mt-10 flex justify-center">
          <HomeMarketingPillLink href="/schedule" label={t("viewSchedule")} variant="silverSchedule" />
        </div>

        <CoachesPagination
          counterText={t("coachesCounter", { current: active + 1, total: slideCount })}
          groupAriaLabel={t("coachesCounter", { current: active + 1, total: slideCount })}
          prevLabel={t("coachesPrevAria")}
          nextLabel={t("coachesNextAria")}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </section>
  );
}
