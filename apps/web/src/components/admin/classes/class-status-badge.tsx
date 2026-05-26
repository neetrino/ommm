"use client";

import { useTranslations } from "next-intl";
import type { ClassStatusValue } from "@/components/admin/admin-classes-types";

type ClassStatusBadgeProps = {
  status: ClassStatusValue;
};

function toneByStatus(status: ClassStatusValue): string {
  if (status === "ACTIVE") return "border-mint-200/80 bg-mint-50/90 text-sage-800";
  if (status === "FULL") return "border-amber-200/80 bg-amber-50/90 text-amber-800";
  if (status === "CANCELLED") return "border-red-200/80 bg-red-50/90 text-red-800";
  return "border-sand-300/80 bg-sand-100/90 text-sage-700";
}

export function ClassStatusBadge({ status }: ClassStatusBadgeProps) {
  const t = useTranslations("adminPages.classes");
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneByStatus(status)}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}
