/** Intersection margins and skeleton heights for deferred marketing sections. */
export const MARKETING_LAZY_SECTION = {
  preloadMarginPx: 480,
  mountMarginPx: 360,
  placeholders: {
    packageCategory: "h-40 rounded-[24px] border border-white/50 bg-white/35 sm:h-48",
    contactForm:
      "min-h-[clamp(22rem,55vw,28rem)] rounded-[24px] border border-white/50 bg-white/35",
    mapEmbed:
      "min-h-[clamp(16rem,45vw,20rem)] rounded-[24px] border border-white/50 bg-white/35",
  },
} as const;
