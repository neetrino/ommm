"use client";

import dynamic from "next/dynamic";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";

const sectionFallback = (placeholderClassName: string) =>
  function HomeDeferredClientSectionFallback() {
    return <div aria-hidden className={placeholderClassName} />;
  };

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
