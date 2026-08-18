"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const PAGE_APPEAR_DURATION_SEC = 0.42;
const PAGE_APPEAR_OFFSET_PX = 14;
const PAGE_APPEAR_EASE = [0.22, 1, 0.36, 1] as const;

type WorkspacePageAppearProps = {
  pathname: string;
  children: ReactNode;
};

/** Soft fade-up when workspace page content mounts after a sidebar navigation. */
export function WorkspacePageAppear({ pathname, children }: WorkspacePageAppearProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return children;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: PAGE_APPEAR_OFFSET_PX }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: PAGE_APPEAR_DURATION_SEC, ease: PAGE_APPEAR_EASE }}
    >
      {children}
    </motion.div>
  );
}
