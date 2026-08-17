"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { AdminSettingsTabNav } from "@/components/admin/admin-settings-tab-nav";
import { resolveAdminSettingsTabFromPathname } from "@/components/admin/admin-settings-module";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
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
    case "studio":
    default:
      return "studioDescription";
  }
}

function AdminSettingsUnifiedHeaderInner() {
  const t = useTranslations("adminPages.settings");
  const headerRef = useAdminStickyHeaderOffset(true);
  const pathname = usePathname();
  const tab = resolveAdminSettingsTabFromPathname(pathname);
  const descriptionKey = resolveSettingsDescriptionKey(tab);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 max-sm:justify-center sm:flex-row sm:items-center sm:justify-start">
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-center gap-3 sm:w-auto sm:justify-start">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminSettingsTabNav />
        </div>
      </div>
      {descriptionKey ? (
        <p className="ommm-body-muted mt-1 max-w-3xl text-sm max-sm:mx-auto max-sm:text-center sm:mx-0 sm:text-left">
          {t(descriptionKey)}
        </p>
      ) : null}
    </WorkspaceStickyPageHeader>
  );
}

function AdminSettingsUnifiedHeaderFallback() {
  const t = useTranslations("adminPages.settings");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 max-sm:justify-center sm:flex-row sm:items-center sm:justify-start">
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-center gap-3 sm:w-auto sm:justify-start">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminSettingsTabNav />
        </div>
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
