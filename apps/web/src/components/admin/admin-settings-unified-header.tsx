"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { AdminSettingsTabNav } from "@/components/admin/admin-settings-tab-nav";
import { resolveAdminSettingsTabFromPathname } from "@/components/admin/admin-settings-module";
import {
  WhatsappBrandIcon,
  WHATSAPP_BRAND_ICON_SM_CLASS,
} from "@/components/ui/whatsapp-brand-icon";
import { useAdminPageHeaderSticky, useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";

function resolveSettingsDescriptionKey(
  tab: ReturnType<typeof resolveAdminSettingsTabFromPathname>,
): string | null {
  switch (tab) {
    case "home-sections":
    case "languages":
      return null;
    case "identity":
    case "location":
    case "contact":
      return `studioSections.${tab}`;
    case "whatsapp":
      return "whatsappDescription";
    case "studio":
    default:
      return "studioDescription";
  }
}

function AdminSettingsUnifiedHeaderInner() {
  const t = useTranslations("adminPages.settings");
  const stickyEnabled = useAdminPageHeaderSticky(true);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);
  const pathname = usePathname();
  const tab = resolveAdminSettingsTabFromPathname(pathname);
  const descriptionKey = resolveSettingsDescriptionKey(tab);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 overflow-visible max-sm:justify-center sm:justify-start">
        <h1 className="ommm-admin-header-title shrink-0">{t("title")}</h1>
        <AdminSettingsTabNav />
      </div>
      {descriptionKey ? (
        <p className="ommm-body-muted mt-1 flex max-w-3xl items-center gap-2 text-sm max-sm:mx-auto max-sm:justify-center max-sm:text-center sm:mx-0 sm:text-left">
          {tab === "whatsapp" ? (
            <WhatsappBrandIcon className={WHATSAPP_BRAND_ICON_SM_CLASS} />
          ) : null}
          {t(descriptionKey)}
        </p>
      ) : null}
    </WorkspaceStickyPageHeader>
  );
}

function AdminSettingsUnifiedHeaderFallback() {
  const t = useTranslations("adminPages.settings");
  const stickyEnabled = useAdminPageHeaderSticky(true);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 overflow-visible max-sm:justify-center sm:justify-start">
        <h1 className="ommm-admin-header-title shrink-0">{t("title")}</h1>
        <AdminSettingsTabNav />
      </div>
    </WorkspaceStickyPageHeader>
  );
}

export function AdminSettingsUnifiedHeader() {
  return (
    <Suspense fallback={<AdminSettingsUnifiedHeaderFallback />}>
      <AdminSettingsUnifiedHeaderInner />
    </Suspense>
  );
}
