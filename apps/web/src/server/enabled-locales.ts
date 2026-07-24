import { cache } from "react";
import {
  createDefaultEnabledLocales,
  normalizeEnabledLocales,
  type EnabledLocalesMap,
} from "@/lib/enabled-locales";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { serverApiJsonPublic } from "@/lib/server-api";

type EnabledLocalesResponse = {
  locales: EnabledLocalesMap;
};

/** Tagged enabled-locales read — busted via `revalidatePublicStudio` after admin edits. */
async function fetchEnabledLocalesCached(): Promise<EnabledLocalesMap> {
  const res = await serverApiJsonPublic<EnabledLocalesResponse>("/studio/enabled-locales", {
    tags: [PUBLIC_CACHE_TAGS.enabledLocales],
  });
  if (!res.ok) {
    return createDefaultEnabledLocales();
  }

  return normalizeEnabledLocales(
    res.data.locales ?? createDefaultEnabledLocales(),
  );
}

/** Deduped per request; tagged cache with admin invalidation. */
export const getEnabledLocales = cache(fetchEnabledLocalesCached);
