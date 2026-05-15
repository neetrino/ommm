"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import {
  FeaturedCoachesCarouselStrip,
  PEEK_LAYOUT_MIN_VIEWPORT_PX,
  type CoachSlideCopy,
} from "@/components/marketing/home/marketing-public-home-coaches-carousel";

const FEATURED_COACHES_AUTO_ADVANCE_MS = 5000;

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

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }
    const mq = window.matchMedia(`(min-width: ${PEEK_LAYOUT_MIN_VIEWPORT_PX}px)`);
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
      if (!mq.matches || motionMq.matches) {
        return;
      }
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          goNext();
        }
      }, FEATURED_COACHES_AUTO_ADVANCE_MS);
    };

    armInterval();
    mq.addEventListener("change", armInterval);
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
      mq.removeEventListener("change", armInterval);
      motionMq.removeEventListener("change", armInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearIntervalIfSet();
    };
  }, [active, goNext, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  return (
    <section
      className={`${marketingMontserrat.variable} w-full py-16`}
      style={{
        background: `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.coachesGradientFrom}, ${HOME_PAGE_SURFACE.coachesGradientTo})`,
      }}
    >
      <div className="mx-auto max-w-[min(80rem,calc(100%-2rem))] px-4 sm:px-6 md:px-10 lg:px-20">
        <h2 className="text-center font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[1.05] text-[#fbf5d5]">
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

      <div className="mx-auto mt-10 flex max-w-[min(80rem,calc(100%-2rem))] justify-center px-4 sm:px-6 md:px-10 lg:px-20">
        <HomeMarketingPillLink href="/schedule" label={t("viewSchedule")} variant="silverSchedule" />
      </div>
    </section>
  );
}
