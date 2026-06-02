import { cache } from "react";
import { serverApiJsonPublic } from "@/lib/server-api";

/** Dedupes identical public API reads within one RSC request (page + metadata). */
export const fetchPublicJsonCached = cache(serverApiJsonPublic);
