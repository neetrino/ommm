/** Intersection margins and skeleton heights for deferred home sections. */
export const HOME_LAZY_SECTION = {
  /** Start prefetching API/data before the section enters the viewport. */
  preloadMarginPx: 520,
  /** Mount section content when within this distance of the viewport bottom. */
  mountMarginPx: 380,
  /** Classes overlap the hero schedule — mount slightly earlier. */
  classesMountMarginPx: 480,
  placeholders: {
    classes: "h-[clamp(24rem,48vw,44rem)]",
    coaches: "h-[clamp(28rem,55vw,52rem)]",
    plans: "h-[clamp(22rem,42vw,40rem)]",
    gallery: "h-[clamp(24rem,50vw,46rem)]",
    footer: "h-[clamp(16rem,28vw,22rem)]",
  },
} as const;
