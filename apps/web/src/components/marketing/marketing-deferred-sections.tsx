import dynamic from "next/dynamic";

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
    loading: deferredPlaceholder(
      "h-40 animate-pulse rounded-[24px] border border-white/50 bg-white/35 sm:h-48",
    ),
  },
);

export const MarketingPublicCoachesGridDeferred = dynamic(
  () =>
    import("@/components/marketing/coaches/marketing-public-coaches-grid").then(
      (module) => module.MarketingPublicCoachesGrid,
    ),
  {
    loading: deferredPlaceholder(
      "h-40 animate-pulse rounded-[24px] border border-white/50 bg-white/35 sm:h-48",
    ),
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
