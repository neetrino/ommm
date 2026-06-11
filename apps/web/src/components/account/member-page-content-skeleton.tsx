type MemberPageContentSkeletonProps = {
  rows?: number;
};

/** Placeholder while member route bundles and data load. */
export function MemberPageContentSkeleton({ rows = 3 }: MemberPageContentSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-24 rounded-[20px] border border-white/60 bg-white/75 sm:h-28"
        />
      ))}
    </div>
  );
}
