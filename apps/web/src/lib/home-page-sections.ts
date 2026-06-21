export {
  HOME_PAGE_SECTION_DEFINITIONS,
  HOME_PAGE_SECTION_KEYS,
  createDefaultHomePageSectionVisibility,
  isHomePageSectionKey,
  parseHomePageSectionVisibilityJson,
  serializeHomePageSectionVisibility,
  type HomePageSectionDefinition,
  type HomePageSectionKey,
  type HomePageSectionVisibility,
} from "@ommm/database";

import {
  HOME_PAGE_SECTION_DEFINITIONS,
  type HomePageSectionKey,
  type HomePageSectionVisibility,
} from "@ommm/database";
import {
  MARKETING_NAV_LINKS,
  type MarketingNavKey,
} from "@/components/marketing/marketing-nav-links";

const MEMBERSHIP_ROUTE_PREFIXES = [
  "/package",
  "/membership",
  "/memberships",
  "/packages",
] as const;

/** Maps a locale-free marketing pathname to a section key (null when unrelated). */
export function resolveMarketingSectionKeyFromPath(
  path: string | null | undefined,
): HomePageSectionKey | null {
  if (path === null || path === undefined || path.length === 0) {
    return null;
  }

  if (path === "/" || path.startsWith("/?")) {
    return "home";
  }

  for (const definition of HOME_PAGE_SECTION_DEFINITIONS) {
    if (definition.routePath === null) {
      continue;
    }

    if (definition.key === "memberships") {
      if (MEMBERSHIP_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
        return "memberships";
      }
      continue;
    }

    if (path === definition.routePath || path.startsWith(`${definition.routePath}/`)) {
      return definition.key;
    }
  }

  return null;
}

export function isHomeSectionEnabled(
  visibility: HomePageSectionVisibility,
  key: HomePageSectionKey,
): boolean {
  return visibility[key] !== false;
}

/** Maps a marketing href (`/schedule`, `/packages`, …) to a section key. */
export function resolveMarketingSectionKeyFromHref(
  href: string,
): HomePageSectionKey | null {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return resolveMarketingSectionKeyFromPath(normalized);
}

/** Whether a marketing href should navigate (false when its section is disabled). */
export function isMarketingHrefEnabled(
  href: string,
  visibility: HomePageSectionVisibility,
): boolean {
  const sectionKey = resolveMarketingSectionKeyFromHref(href);
  if (sectionKey === null || sectionKey === "home") {
    return true;
  }
  return isHomeSectionEnabled(visibility, sectionKey);
}

export type MarketingNavLinkDefinition = (typeof MARKETING_NAV_LINKS)[number];

export function filterMarketingNavLinks(
  visibility: HomePageSectionVisibility,
): MarketingNavLinkDefinition[] {
  return MARKETING_NAV_LINKS.filter((link) =>
    isHomeSectionEnabled(visibility, link.key as HomePageSectionKey),
  );
}

export function marketingNavKeyForSectionKey(key: HomePageSectionKey): MarketingNavKey {
  return key as MarketingNavKey;
}
