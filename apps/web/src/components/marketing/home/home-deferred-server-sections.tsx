import dynamic from "next/dynamic";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";

function sectionPlaceholder(className: string) {
  return function HomeDeferredServerSectionFallback() {
    return <div aria-hidden className={className} />;
  };
}

/** Async server sections — must use dynamic() from a Server Module, not `"use client"`. */
export const HomeClassesSectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-classes-section").then(
      (module) => module.MarketingPublicHomeClassesSection,
    ),
  {
    loading: sectionPlaceholder(HOME_LAZY_SECTION.placeholders.classes),
  },
);

export const HomePlansSectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-plans-section").then(
      (module) => module.MarketingPublicHomePlansSection,
    ),
  {
    loading: sectionPlaceholder(HOME_LAZY_SECTION.placeholders.plans),
  },
);

export const HomeCoachesSectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-coaches-section-server").then(
      (module) => module.MarketingPublicHomeCoachesSectionServer,
    ),
  {
    loading: sectionPlaceholder(HOME_LAZY_SECTION.placeholders.coaches),
  },
);

export const HomeFooterSectionDeferred = dynamic(
  () =>
    import("@/components/marketing/home/marketing-public-home-footer").then(
      (module) => module.MarketingPublicHomeFooter,
    ),
  {
    loading: sectionPlaceholder(HOME_LAZY_SECTION.placeholders.footer),
  },
);
