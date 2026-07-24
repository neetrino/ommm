"use server";

import { updateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

/** Invalidate cached public studio and home-section visibility reads. */
export async function revalidatePublicStudioAction(): Promise<void> {
  updateTag(PUBLIC_CACHE_TAGS.studio);
  updateTag(PUBLIC_CACHE_TAGS.homeSections);
  updateTag(PUBLIC_CACHE_TAGS.enabledLocales);
}
