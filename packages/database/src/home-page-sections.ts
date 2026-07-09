/** Canonical marketing home page section keys — keep in sync with `MARKETING_NAV_LINKS`. */
export const HOME_PAGE_SECTION_KEYS = [
  "home",
  "story",
  "schedule",
  "presalePackages",
  "memberships",
  "coaches",
  "explore",
  "contact",
] as const;

export type HomePageSectionKey = (typeof HOME_PAGE_SECTION_KEYS)[number];

export type HomePageSectionVisibilityGroup = "homeBanner" | "siteSection";

export type HomePageSectionVisibility = Record<HomePageSectionKey, boolean>;

export type HomePageSectionDefinition = {
  key: HomePageSectionKey;
  /** Locale-free marketing route used for section guard (null = home blocks only). */
  routePath: string | null;
  /** Whether the section renders blocks on the marketing home page. */
  rendersOnHomePage: boolean;
  /** Admin settings grouping — home banners vs site navigation/pages. */
  visibilityGroup: HomePageSectionVisibilityGroup;
  /** When false, omitted from admin toggles and always treated as enabled. */
  adminConfigurable: boolean;
};

/** Keys exposed in admin Home Page Sections toggles. */
export const HOME_PAGE_ADMIN_VISIBILITY_KEYS = HOME_PAGE_SECTION_KEYS.filter(
  (key): key is Exclude<HomePageSectionKey, "home"> => key !== "home",
);

/** Single registry for admin UI, API validation, and public rendering. */
export const HOME_PAGE_SECTION_DEFINITIONS: readonly HomePageSectionDefinition[] = [
  {
    key: "home",
    routePath: "/",
    rendersOnHomePage: true,
    visibilityGroup: "homeBanner",
    adminConfigurable: false,
  },
  {
    key: "story",
    routePath: "/story",
    rendersOnHomePage: false,
    visibilityGroup: "siteSection",
    adminConfigurable: true,
  },
  {
    key: "schedule",
    routePath: "/schedule",
    rendersOnHomePage: true,
    visibilityGroup: "siteSection",
    adminConfigurable: true,
  },
  {
    key: "presalePackages",
    routePath: null,
    rendersOnHomePage: true,
    visibilityGroup: "homeBanner",
    adminConfigurable: true,
  },
  {
    key: "memberships",
    routePath: "/package",
    rendersOnHomePage: false,
    visibilityGroup: "siteSection",
    adminConfigurable: true,
  },
  {
    key: "coaches",
    routePath: "/coaches",
    rendersOnHomePage: true,
    visibilityGroup: "siteSection",
    adminConfigurable: true,
  },
  {
    key: "explore",
    routePath: "/explore",
    rendersOnHomePage: true,
    visibilityGroup: "siteSection",
    adminConfigurable: true,
  },
  {
    key: "contact",
    routePath: "/contact",
    rendersOnHomePage: true,
    visibilityGroup: "siteSection",
    adminConfigurable: true,
  },
] as const;

export function createDefaultHomePageSectionVisibility(): HomePageSectionVisibility {
  return Object.fromEntries(
    HOME_PAGE_SECTION_KEYS.map((key) => [key, true]),
  ) as HomePageSectionVisibility;
}

/** Fills missing section keys with defaults — used by API and web after partial reads. */
export function normalizeHomePageSectionVisibility(
  visibility: Partial<HomePageSectionVisibility> | null | undefined,
): HomePageSectionVisibility {
  const normalized = createDefaultHomePageSectionVisibility();
  if (visibility === null || visibility === undefined) {
    return normalized;
  }

  for (const key of HOME_PAGE_SECTION_KEYS) {
    const value = visibility[key];
    if (typeof value === "boolean") {
      normalized[key] = value;
    }
  }

  normalized.home = true;

  return normalized;
}

export function getHomePageSectionDefinitionsByGroup(
  group: HomePageSectionVisibilityGroup,
  options?: { adminConfigurableOnly?: boolean },
): readonly HomePageSectionDefinition[] {
  return HOME_PAGE_SECTION_DEFINITIONS.filter(
    (definition) =>
      definition.visibilityGroup === group &&
      (!options?.adminConfigurableOnly || definition.adminConfigurable),
  );
}

export function isHomePageSectionKey(value: string): value is HomePageSectionKey {
  return (HOME_PAGE_SECTION_KEYS as readonly string[]).includes(value);
}

export function parseHomePageSectionVisibilityJson(
  json: string | null | undefined,
): HomePageSectionVisibility {
  const defaults = createDefaultHomePageSectionVisibility();
  if (json === null || json === undefined || json.trim().length === 0) {
    return defaults;
  }

  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return defaults;
    }

    for (const key of HOME_PAGE_SECTION_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === "boolean") {
        defaults[key] = value;
      }
    }

    return defaults;
  } catch {
    return defaults;
  }
}

export function serializeHomePageSectionVisibility(
  visibility: HomePageSectionVisibility,
): string {
  return JSON.stringify(visibility);
}
