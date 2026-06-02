"use client";

import dynamic from "next/dynamic";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";

const sectionFallback = (placeholderClassName: string) =>
  function HomeDeferredSectionFallback() {
    return <div aria-hidden className={placeholderClassName} />;
  };

/** Coaches carousel — framer-motion + infinite track; split from the main bundle. */
export const HomeCoachesSectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-coaches-section").then(
      (module) => module.MarketingPublicHomeCoachesSection,
    ),
  {
    loading: sectionFallback(HOME_LAZY_SECTION.placeholders.coaches),
  },
);

/** Gallery mosaic carousel — client-only; split from the main bundle. */
export const HomeGallerySectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-gallery-section").then(
      (module) => module.MarketingPublicHomeGallerySection,
    ),
  {
    loading: sectionFallback(HOME_LAZY_SECTION.placeholders.gallery),
  },
);
