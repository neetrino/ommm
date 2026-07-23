"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ADMIN_SETTINGS_TAB_HREF,
  ADMIN_SETTINGS_TAB_IDS,
  resolveAdminSettingsTabFromPathname,
  type AdminSettingsTabId,
} from "@/components/admin/admin-settings-module";

const TAB_LABEL_KEY: Record<AdminSettingsTabId, string> = {
  studio: "studio",
  "home-sections": "homeSections",
  identity: "identity",
  location: "location",
  contact: "contact",
};

export function AdminSettingsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("adminPages.settings.tabs");
  const pathname = usePathname();
  const activeTab = resolveAdminSettingsTabFromPathname(pathname);

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={`flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {ADMIN_SETTINGS_TAB_IDS.map((tab) => {
        const href = ADMIN_SETTINGS_TAB_HREF[tab];
        const active = activeTab === tab;
        return (
          <Link
            key={tab}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={
              active
                ? "ommm-admin-pill-tab ommm-admin-pill-tab-active shrink-0 px-4 normal-case tracking-normal"
                : "ommm-admin-pill-tab shrink-0 px-4 normal-case tracking-normal"
            }
          >
            {t(TAB_LABEL_KEY[tab])}
          </Link>
        );
      })}
    </nav>
  );
}
