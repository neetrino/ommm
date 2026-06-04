/** Intersection margins and skeleton heights for deferred home sections. */
export const HOME_LAZY_SECTION = {
  /** Start prefetching API/data before the section enters the viewport. */
  preloadMarginPx: 520,
  /** Mount section content when within this distance of the viewport bottom. */
  mountMarginPx: 380,
  /** Classes overlap the hero schedule — mount slightly earlier. */
  classesMountMarginPx: 480,
  placeholders: {
    classes: "h-[clamp(34rem,88svw,55rem)] tablet:h-[clamp(24rem,48vw,44rem)]",
    coaches: "h-[clamp(52rem,130svw,58rem)] bg-[#577f91] tablet:h-[clamp(28rem,55vw,52rem)] tablet:bg-transparent",
    plans: "h-[clamp(22rem,42vw,40rem)]",
    gallery: "h-[clamp(24rem,50vw,46rem)]",
    footer: "h-[clamp(16rem,28vw,22rem)]",
    scheduleGrid: "min-h-[clamp(16rem,32vw,24rem)] w-full",
  },
} as const;
