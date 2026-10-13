const PACKAGE_BOOK_REFERENCE_KEY = "ommm:packageBookReference";

export function writePackageBookReference(reference: string): void {
  window.sessionStorage.setItem(PACKAGE_BOOK_REFERENCE_KEY, reference);
}

export function readPackageBookReference(): string | null {
  const value = window.sessionStorage.getItem(PACKAGE_BOOK_REFERENCE_KEY)?.trim();
  return value && value.length > 0 ? value : null;
}

export function clearPackageBookReference(): void {
  window.sessionStorage.removeItem(PACKAGE_BOOK_REFERENCE_KEY);
}
