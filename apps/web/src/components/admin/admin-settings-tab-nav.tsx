"use client";

import { useId } from "react";
import { LayoutGroup } from "framer-motion";
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
import { OliveSegmentedActiveThumb } from "@/components/ui/olive-segmented-active-thumb";
import {
  oliveSegmentedHugSegmentClassName,
  oliveSegmentedHugTrackClass,
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

const SETTINGS_PILL_LAYOUT_ID = "admin-settings-olive-segmented-pill";

export function AdminSettingsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("adminPages.settings.tabs");
  const pathname = usePathname();
  const activeTab = resolveAdminSettingsTabFromPathname(pathname);
  const layoutGroupId = useId();

  return (
    <LayoutGroup id={layoutGroupId}>
      <nav
        role="tablist"
        aria-label={t("aria")}
        className={oliveSegmentedHugTrackClass(className)}
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
              className={oliveSegmentedHugSegmentClassName(active)}
            >
              {active ? (
                <OliveSegmentedActiveThumb layoutId={SETTINGS_PILL_LAYOUT_ID} />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {tab === "whatsapp" ? (
                  <WhatsappBrandIcon className={WHATSAPP_BRAND_ICON_SM_CLASS} />
                ) : null}
                {t(TAB_LABEL_KEY[tab])}
              </span>
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
