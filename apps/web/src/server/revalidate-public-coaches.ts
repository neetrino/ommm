"use server";

import { updateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

/** Invalidate cached public coaches reads (home featured + /coaches page). */
export async function revalidatePublicCoachesAction(): Promise<void> {
  updateTag(PUBLIC_CACHE_TAGS.coaches);
}
