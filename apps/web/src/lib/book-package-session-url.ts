export const BOOK_PACKAGE_SESSION_QUERY_KEY = "bookPackageSession";

export function readBookPackageSessionId(
  searchParams: URLSearchParams | Readonly<URLSearchParams>,
): string | null {
  const value = searchParams.get(BOOK_PACKAGE_SESSION_QUERY_KEY)?.trim();
  return value && value.length > 0 ? value : null;
}

export function setBookPackageSessionQuery(
  params: URLSearchParams,
  sessionId: string,
): void {
  params.set(BOOK_PACKAGE_SESSION_QUERY_KEY, sessionId);
}

export function clearBookPackageSessionQuery(params: URLSearchParams): void {
  params.delete(BOOK_PACKAGE_SESSION_QUERY_KEY);
}
