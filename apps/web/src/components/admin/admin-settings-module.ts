export type AdminSettingsTabId =
  | "studio"
  | "home-sections"
  | "identity"
  | "location"
  | "contact";

export const ADMIN_SETTINGS_TAB_IDS: readonly AdminSettingsTabId[] = [
  "studio",
  "home-sections",
  "identity",
  "location",
  "contact",
] as const;

export const ADMIN_SETTINGS_TAB_HREF: Record<AdminSettingsTabId, string> = {
  studio: "/admin/settings",
  "home-sections": "/admin/settings/home-sections",
  identity: "/admin/settings/identity",
  location: "/admin/settings/location",
  contact: "/admin/settings/contact",
};

const STUDIO_SUBTAB_SUFFIXES = ["/identity", "/location", "/contact"] as const;

/** @deprecated Use resolveAdminSettingsTabFromPathname */
export type AdminSettingsSectionId = "studio" | "home-sections";

export function resolveAdminSettingsTabFromPathname(
  pathname: string,
): AdminSettingsTabId | null {
  for (const suffix of STUDIO_SUBTAB_SUFFIXES) {
    if (pathname.endsWith(suffix)) {
      const key = suffix.slice(1) as "identity" | "location" | "contact";
      return key;
    }
  }

  if (pathname.endsWith("/home-sections")) {
    return "home-sections";
  }

  if (pathname === "/admin/settings" || pathname.endsWith("/admin/settings")) {
    return "studio";
  }

  return null;
}

export function resolveAdminSettingsSectionFromPathname(
  pathname: string,
): AdminSettingsSectionId | null {
  const tab = resolveAdminSettingsTabFromPathname(pathname);
  if (tab === "home-sections") {
    return "home-sections";
  }
  if (
    tab === "studio" ||
    tab === "identity" ||
    tab === "location" ||
    tab === "contact"
  ) {
    return "studio";
  }
  return null;
}
