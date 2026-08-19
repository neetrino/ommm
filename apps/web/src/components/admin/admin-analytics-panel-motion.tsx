"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { adminFilterRevealVariants } from "@/components/admin/admin-filter-reveal-motion";

type AdminAnalyticsPanelSectionProps = {
  index: number;
  children: ReactNode;
};

export function AdminAnalyticsPanelSection({ index, children }: AdminAnalyticsPanelSectionProps) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      variants={adminFilterRevealVariants(index, reducedMotion)}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
