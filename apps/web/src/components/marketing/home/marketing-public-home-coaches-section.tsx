"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { useCallback, useState } from "react";

const SLIDE_COUNT = 3;

/**
 * Figma **Featured Coaches** `155:188` — carousel + schedule CTA.
 */
export function MarketingPublicHomeCoachesSection() {
  const t = useTranslations("marketingPublic.home");
  const [active, setActive] = useState(0);

  const goPrev = useCallback(() => {
    setActive((i) => (i - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % SLIDE_COUNT);
  }, []);

  return (
    <section
      className={`${marketingMontserrat.variable} w-full px-4 py-16 sm:px-6 md:px-10 lg:px-20`}
      style={{
        background: `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.coachesGradientFrom}, ${HOME_PAGE_SURFACE.coachesGradientTo})`,
      }}
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[48px] text-[#fbf5d5]">
          {t("coachesTitle")}
        </h2>

        <div className="relative mt-10 flex min-h-[280px] items-center justify-center gap-2 md:gap-4">
          <CoachNavButton direction="prev" label={t("coachesPrevAria")} onPress={goPrev} />

          <div className="relative z-10 w-full max-w-[729px] overflow-hidden rounded-[40px] bg-[#e5f4f9] shadow-sm md:mx-4">
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 md:items-start md:gap-10 md:p-10">
              <div className="order-2 flex flex-col gap-4 md:order-1">
                <p
                  className={`${marketingMontserrat.className} text-[44px] font-extrabold leading-[31.2px] tracking-[0.72px] text-[#1d1c15]`}
                >
                  {t(`coachSlides.${active}.name`)}
                </p>
                <p className={`${marketingMontserrat.className} text-base font-bold text-[#4a4738]`}>
                  {t(`coachSlides.${active}.role`)}
                </p>
                <p className={`${marketingMontserrat.className} text-base font-normal leading-6 text-[#4a4738]`}>
                  {t(`coachSlides.${active}.bio`)}
                </p>
                <p className={`${marketingMontserrat.className} text-base font-bold text-[#4a4738]`}>
                  {t(`coachSlides.${active}.experience`)}
                </p>
              </div>
              <div className="relative order-1 mx-auto aspect-[342/597] w-full max-w-[220px] md:order-2 md:max-w-[280px]">
                <Image
                  src={HOME_SECTION_ASSETS.coachPortrait}
                  alt={t(`coachSlides.${active}.imageAlt`)}
                  fill
                  sizes="(max-width: 768px) 220px, 280px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          <CoachNavButton direction="next" label={t("coachesNextAria")} onPress={goNext} />
        </div>

        <div className="mt-10 flex justify-center">
          <HomeMarketingPillLink href="/schedule" label={t("viewSchedule")} variant="silverSchedule" />
        </div>
      </div>
    </section>
  );
}

type CoachNavButtonProps = {
  direction: "prev" | "next";
  label: string;
  onPress: () => void;
};

function CoachNavButton({ direction, label, onPress }: CoachNavButtonProps) {
  const rotate = direction === "next" ? "rotate-180" : "";
  return (
    <button
      type="button"
      className="relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-[40px] bg-[rgba(255,255,255,0.15)] transition-[transform,opacity] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:h-16 md:w-16"
      aria-label={label}
      onClick={onPress}
    >
      <Image
        src={HOME_SECTION_ASSETS.carouselArrow}
        alt=""
        width={24}
        height={24}
        unoptimized
        className={`${rotate} h-3 w-3 md:h-4 md:w-4`}
      />
    </button>
  );
}
