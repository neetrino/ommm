"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { marketingRevealMotionProps } from "@/components/marketing/marketing-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type MarketingRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
};

/** Fade/slide-in wrapper for marketing sections and cards. */
export function MarketingReveal({ index, children, className }: MarketingRevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div className={className} {...marketingRevealMotionProps(index, reducedMotion)}>
      {children}
    </motion.div>
  );
}
