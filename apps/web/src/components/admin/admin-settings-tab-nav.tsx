"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ADMIN_SETTINGS_TAB_HREF,
  ADMIN_SETTINGS_TAB_IDS,
  resolveAdminSettingsTabFromPathname,
  type AdminSettingsTabId,
} from "@/components/admin/admin-settings-module";
import {
  WhatsappBrandIcon,
  WHATSAPP_BRAND_ICON_SM_CLASS,
} from "@/components/ui/whatsapp-brand-icon";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
  type OliveSegmentedColumnCount,
} from "@/components/ui/olive-segmented-switcher";

const TAB_LABEL_KEY: Record<AdminSettingsTabId, string> = {
  studio: "studio",
  "home-sections": "homeSections",
  languages: "languages",
  identity: "identity",
  location: "location",
  contact: "contact",
  whatsapp: "whatsapp",
};

const SETTINGS_SWITCHER_COLUMN_COUNT =
  ADMIN_SETTINGS_TAB_IDS.length as OliveSegmentedColumnCount;

export function AdminSettingsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("adminPages.settings.tabs");
  const pathname = usePathname();
  const activeTab = resolveAdminSettingsTabFromPathname(pathname);
  const activeIndex = Math.max(
    0,
    ADMIN_SETTINGS_TAB_IDS.findIndex((tab) => tab === activeTab),
  );

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={oliveSegmentedTrackClass(SETTINGS_SWITCHER_COLUMN_COUNT, className)}
    >
      <span
        aria-hidden
        className={oliveSegmentedThumbClass(SETTINGS_SWITCHER_COLUMN_COUNT, activeIndex)}
      />
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
            className={oliveSegmentedSegmentClassName(active, SETTINGS_SWITCHER_COLUMN_COUNT)}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab === "whatsapp" ? (
                <WhatsappBrandIcon className={WHATSAPP_BRAND_ICON_SM_CLASS} />
              ) : null}
              {t(TAB_LABEL_KEY[tab])}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
