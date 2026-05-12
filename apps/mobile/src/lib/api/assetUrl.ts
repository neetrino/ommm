/**
 * Builds an absolute URL for an API-hosted asset path (e.g. `/v1/uploads/...`).
 */
export function resolveApiAssetUrl(
  apiBase: string,
  pathOrUrl: string | null | undefined,
): string | null {
  if (pathOrUrl === null || pathOrUrl === undefined || pathOrUrl === "") {
    return null;
  }
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base = apiBase.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}
