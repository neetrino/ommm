import dynamic from "next/dynamic";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";
import { MARKETING_LAZY_SECTION } from "@/components/marketing/marketing-lazy-section-tokens";

function deferredPlaceholder(className: string) {
  return function MarketingDeferredSectionFallback() {
    return <div aria-hidden className={className} />;
  };
}

export const MarketingScheduleViewDeferred = dynamic(
  () =>
    import("@/components/marketing/schedule/marketing-schedule-view").then(
      (module) => module.MarketingScheduleView,
    ),
  {
    loading: () => <MarketingPageContentSkeleton cards={1} />,
  },
);

export const MarketingPublicCoachesGridDeferred = dynamic(
  () =>
    import("@/components/marketing/coaches/marketing-public-coaches-grid").then(
      (module) => module.MarketingPublicCoachesGrid,
    ),
  {
    loading: () => <MarketingPageContentSkeleton cards={3} />,
  },
);

export const PublicPackageCategoryListTableDeferred = dynamic(
  () =>
    import("@/components/marketing/packages/public-package-category-list-table").then(
      (module) => module.PublicPackageCategoryListTable,
    ),
  {
    loading: deferredPlaceholder(
      "h-32 animate-pulse rounded-[24px] border border-white/50 bg-white/35",
    ),
  },
);

export const ContactMessageFormDeferred = dynamic(
  () =>
    import("@/components/marketing/contact-message-form").then(
      (module) => module.ContactMessageForm,
    ),
  {
    loading: deferredPlaceholder(MARKETING_LAZY_SECTION.placeholders.contactForm),
  },
);
