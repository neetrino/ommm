import { serverApiJsonPublic } from "@/lib/server-api";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Live public package catalog for immediate admin pricing visibility updates. */
export function fetchPublicPackagesListCached() {
  return serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans", {
    cacheMode: "no-store",
  });
}
