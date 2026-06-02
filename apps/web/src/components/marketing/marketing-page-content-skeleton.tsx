type MarketingPageContentSkeletonProps = {
  cards?: number;
};

/** Instant placeholder while marketing page data streams in. */
export function MarketingPageContentSkeleton({
  cards = 2,
}: MarketingPageContentSkeletonProps) {
  return (
    <div className="mt-12 animate-pulse space-y-6" aria-hidden>
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="h-40 rounded-[24px] border border-white/50 bg-white/35 sm:h-48"
        />
      ))}
    </div>
  );
}

/** Matches fixed marketing header offset on inner routes. */
export function MarketingRouteLoadingSkeleton() {
  return (
    <div className="ommm-section flex-1 w-full pt-16 sm:pt-20 animate-pulse">
      <div className="ommm-container space-y-4">
        <div className="h-10 max-w-md rounded-lg bg-white/40" />
        <div className="h-5 max-w-xl rounded bg-white/30" />
        <MarketingPageContentSkeleton cards={3} />
      </div>
    </div>
  );
}
