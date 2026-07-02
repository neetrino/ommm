"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  adminFilterEmptyStateVariants,
} from "@/components/admin/admin-filter-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type AdminPackagesEmptyStateProps = {
  children: ReactNode;
};

export function AdminPackagesEmptyState({ children }: AdminPackagesEmptyStateProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="flex min-h-[min(48vh,32rem)] w-full items-center justify-center px-4 py-16 sm:py-20"
      variants={adminFilterEmptyStateVariants(reducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-xl rounded-[22px] border border-white/60 bg-white/55 px-8 py-10 text-center shadow-[0_16px_36px_-24px_rgba(45,40,35,0.2)] backdrop-blur-md">
        <p className="text-sm leading-relaxed text-sage-600">{children}</p>
      </div>
    </motion.div>
  );
}
