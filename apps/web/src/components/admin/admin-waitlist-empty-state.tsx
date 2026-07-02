"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";

export function AdminWaitlistEmptyState() {
  const t = useTranslations("adminPages.waitlists");
  return <div className={adminChrome.panel}>{t("empty")}</div>;
}
