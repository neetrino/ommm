/** Stored paths and URLs always start with this prefix (served as static files). */
export const HOME_IMAGE_PUBLIC_PREFIX = '/v1/uploads/';

/** Max upload size for Home banner images (5 MiB). */
export const HOME_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ALLOWED_HOME_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MIME_TO_EXT: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Some clients send non-standard `image/jpg`; normalize before validation. */
export function normalizeHomeImageMime(mimetype: string): string {
  const m = mimetype.trim().toLowerCase();
  if (m === 'image/jpg') {
    return 'image/jpeg';
  }
  return m;
}
