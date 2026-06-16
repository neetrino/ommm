"use server";

import { updateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

/** Invalidate cached public package reads (home plans + /packages page). */
export async function revalidatePublicPackagesAction(): Promise<void> {
  updateTag(PUBLIC_CACHE_TAGS.packages);
}
