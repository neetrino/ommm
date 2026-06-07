import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";

function resolvePublicApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    process.env.API_INTERNAL_URL?.replace(/\/$/, "") ??
    ""
  );
}

/**
 * Builds an absolute URL for API-hosted static uploads (e.g. `/v1/uploads/...`).
 */
export function resolveApiAssetUrl(
  pathOrUrl: string | null | undefined,
): string | undefined {
  if (pathOrUrl === null || pathOrUrl === undefined || pathOrUrl === "") {
    return undefined;
  }
  let candidate: string | undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    candidate = pathOrUrl;
  } else {
    const base = resolvePublicApiBase();
    const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    if (base === "") {
      return undefined;
    }
    candidate = `${base}${path}`;
  }
  return sanitizeImageSrcUrl(candidate) ?? undefined;
}
