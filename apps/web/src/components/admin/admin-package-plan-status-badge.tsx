"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_COACH_STATUS_BADGE_CLASS,
  coachStatusBadgeTone,
} from "@/components/admin/admin-coach-list-badges";

type AdminPackagePlanStatusBadgeProps = {
  isActive: boolean;
};

export function AdminPackagePlanStatusBadge({ isActive }: AdminPackagePlanStatusBadgeProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <span
      className={`${ADMIN_COACH_STATUS_BADGE_CLASS} ${coachStatusBadgeTone(isActive)}`}
    >
      {isActive ? t("statusActive") : t("statusInactive")}
    </span>
  );
}
