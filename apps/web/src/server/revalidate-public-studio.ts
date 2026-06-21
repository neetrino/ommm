"use server";

import { updateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

/** Invalidate cached public studio reads (nav visibility, contact page, etc.). */
export async function revalidatePublicStudioAction(): Promise<void> {
  updateTag(PUBLIC_CACHE_TAGS.studio);
}
