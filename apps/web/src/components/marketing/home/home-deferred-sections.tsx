"use client";

import dynamic from "next/dynamic";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";

const sectionFallback = (placeholderClassName: string) =>
  function HomeDeferredClientSectionFallback() {
    return <div aria-hidden className={placeholderClassName} />;
  };

/** Coaches carousel — framer-motion + infinite track. */
export const HomeCoachesSectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-coaches-section").then(
      (module) => module.MarketingPublicHomeCoachesSection,
    ),
  {
    loading: sectionFallback(HOME_LAZY_SECTION.placeholders.coaches),
  },
);

/** Gallery mosaic carousel — client-only. */
export const HomeGallerySectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-gallery-section").then(
      (module) => module.MarketingPublicHomeGallerySection,
    ),
  {
    loading: sectionFallback(HOME_LAZY_SECTION.placeholders.gallery),
  },
);

/** Weekly schedule grid — tabs, fetch, session rows; split from hero hydration. */
export const HomeWeeklyScheduleGridDeferred = dynamic(
  () =>
    import("@/components/marketing/home/home-weekly-schedule-live-grid").then(
      (module) => module.HomeWeeklyScheduleLiveGrid,
    ),
  {
    loading: sectionFallback(HOME_LAZY_SECTION.placeholders.scheduleGrid),
  },
);

/** Hero junction nav — small client island; deferred from LCP path. */
export const HomeHeroJunctionNavDeferred = dynamic(
  () =>
    import("@/components/marketing/home/home-hero-junction-nav").then(
      (module) => module.HomeHeroJunctionNav,
    ),
  { ssr: false },
);
