import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Cached public package catalog — same ISR path as coaches list. */
export function fetchPublicPackagesListCached() {
  return fetchPublicJsonCached<PublicPackagePlan[]>("/packages/plans", {
    tags: [PUBLIC_CACHE_TAGS.packages],
  });
}
