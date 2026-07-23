type MarketingPageContentSkeletonProps = {
  cards?: number;
};

/** Instant placeholder while marketing page data streams in. */
export function MarketingPageContentSkeleton({
  cards = 2,
}: MarketingPageContentSkeletonProps) {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="h-40 rounded-[24px] border border-white/50 bg-white/35 sm:h-48"
        />
      ))}
    </div>
  );
}
