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

export type HomePageSectionVisibility = Record<HomePageSectionKey, boolean>;

export type HomePageSectionDefinition = {
  key: HomePageSectionKey;
  /** Locale-free marketing route used for section guard (null = home blocks only). */
  routePath: string | null;
  /** Whether the section renders blocks on the marketing home page. */
  rendersOnHomePage: boolean;
};

/** Single registry for admin UI, API validation, and public rendering. */
export const HOME_PAGE_SECTION_DEFINITIONS: readonly HomePageSectionDefinition[] = [
  { key: "home", routePath: "/", rendersOnHomePage: true },
  { key: "story", routePath: "/story", rendersOnHomePage: false },
  { key: "schedule", routePath: "/schedule", rendersOnHomePage: true },
  { key: "presalePackages", routePath: null, rendersOnHomePage: true },
  { key: "memberships", routePath: "/package", rendersOnHomePage: false },
  { key: "coaches", routePath: "/coaches", rendersOnHomePage: true },
  { key: "explore", routePath: "/explore", rendersOnHomePage: true },
  { key: "contact", routePath: "/contact", rendersOnHomePage: true },
] as const;

export function createDefaultHomePageSectionVisibility(): HomePageSectionVisibility {
  return Object.fromEntries(
    HOME_PAGE_SECTION_KEYS.map((key) => [key, true]),
  ) as HomePageSectionVisibility;
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
