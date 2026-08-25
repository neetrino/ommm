"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { adminFilterEmptyStateVariants } from "@/components/admin/admin-filter-reveal-motion";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function AdminStaffActivityEmptyState() {
  const t = useTranslations("staffActivityPages");
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="flex min-h-[min(48vh,32rem)] w-full items-center justify-center px-4 py-16 sm:py-20"
      variants={adminFilterEmptyStateVariants(reducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        className="max-w-md rounded-[24px] border border-white/60 bg-white/55 px-8 py-10 text-center shadow-[0_16px_36px_-24px_rgba(45,40,35,0.2)] backdrop-blur-md sm:px-10 sm:py-12"
        role="status"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-600 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9)]">
          <AdminNavIcon slug="notifications" className="h-6 w-6" />
        </span>
        <h2 className="ommm-h2 mt-6 text-sage-800">{t("emptyTitle")}</h2>
        <p className="ommm-body-muted mx-auto mt-3 max-w-sm">{t("emptyDescription")}</p>
      </div>
    </motion.div>
  );
}
