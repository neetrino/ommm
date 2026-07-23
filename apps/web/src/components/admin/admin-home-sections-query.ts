import {
  HOME_PAGE_ADMIN_VISIBILITY_KEYS,
  isHomePageSectionKey,
  type HomePageSectionKey,
  type HomePageSectionVisibility,
} from "@/lib/home-page-sections";

export const HOME_SECTIONS_VIEW_QUERY_KEY = "view";

export type HomeSectionPendingToggle = {
  key: HomePageSectionKey;
  enabled: boolean;
};

export function parseHomeSectionsViewQuery(value: string | null): HomePageSectionKey | null {
  if (value === null || !isHomePageSectionKey(value)) {
    return null;
  }

  if (
    !(HOME_PAGE_ADMIN_VISIBILITY_KEYS as readonly HomePageSectionKey[]).includes(value)
  ) {
    return null;
  }

  return value;
}

export function resolveHomeSectionPendingToggle(
  key: HomePageSectionKey,
  sections: HomePageSectionVisibility,
): HomeSectionPendingToggle {
  return { key, enabled: !sections[key] };
}
