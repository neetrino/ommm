import { cache } from "react";
import { serverApiJsonPublic } from "@/lib/server-api";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import type { StudioPublicSettings } from "@/lib/studio-social-links";

/** Tagged public studio read — busted via `revalidatePublicStudioAction` after admin edits. */
export const fetchPublicStudioCached = cache(async () => {
  return serverApiJsonPublic<StudioPublicSettings>("/studio", {
    tags: [PUBLIC_CACHE_TAGS.studio],
  });
});
