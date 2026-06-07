export const USER_PACKAGES_PACKAGE_ID_QUERY_KEY = "packageId" as const;

/** Reads the opened user-package membership id from URL search params. */
export function parseUserPackagesPackageId(
  search: Record<string, string | undefined>,
): string | null {
  const raw = search[USER_PACKAGES_PACKAGE_ID_QUERY_KEY]?.trim();
  return raw && raw.length > 0 ? raw : null;
}
