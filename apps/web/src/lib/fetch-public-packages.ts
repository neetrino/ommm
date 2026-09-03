import { cache } from "react";
import { serverApiJsonPublic } from "@/lib/server-api";
import type { PublicPackagePlan } from "@/lib/public-package-plan";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

/** Tagged public package catalog — busted via `revalidatePublicPackages` after admin edits. */
export const fetchPublicPackagesListCached = cache(function fetchPublicPackagesListCached() {
  return serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans", {
    tags: [PUBLIC_CACHE_TAGS.packages],
  });
});
