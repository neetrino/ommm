import type { CoachCardData } from "@/components/coaches/coach-card-display";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

/** Cached public coaches list — tagged for on-demand revalidation after admin edits. */
export function fetchPublicCoachesListCached() {
  return fetchPublicJsonCached<CoachCardData[]>("/coaches", {
    tags: [PUBLIC_CACHE_TAGS.coaches],
  });
}
