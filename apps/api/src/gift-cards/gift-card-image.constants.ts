export const GIFT_CARD_IMAGE_PUBLIC_PREFIX = '/v1/uploads/';

export const GIFT_CARD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ALLOWED_GIFT_CARD_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const GIFT_CARD_IMAGE_MIME_TO_EXT: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function normalizeGiftCardImageMime(mimetype: string): string {
  const normalized = mimetype.trim().toLowerCase();
  if (normalized === 'image/jpg') {
    return 'image/jpeg';
  }
  return normalized;
}
