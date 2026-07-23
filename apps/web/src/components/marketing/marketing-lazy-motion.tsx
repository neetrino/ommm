"use client";

import { domAnimation, LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

type MarketingLazyMotionProps = {
  children: ReactNode;
};

/** Loads only DOM animation features for marketing scroll/carousel motion. */
export function MarketingLazyMotion({ children }: MarketingLazyMotionProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
