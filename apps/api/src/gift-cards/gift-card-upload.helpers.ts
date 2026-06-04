import { join } from 'node:path';
import { GIFT_CARD_IMAGE_PUBLIC_PREFIX } from './gift-card-image.constants';

/**
 * Returns absolute filesystem path for a stored gift-card image upload, or null when value is not a local upload URL.
 */
export function absolutePathForStoredGiftCardUpload(
  uploadRoot: string,
  storedPublicPath: string,
): string | null {
  if (!storedPublicPath.startsWith(GIFT_CARD_IMAGE_PUBLIC_PREFIX)) {
    return null;
  }
  const relative = storedPublicPath.slice(GIFT_CARD_IMAGE_PUBLIC_PREFIX.length);
  const normalized = relative.replace(/^\/+/, '');
  if (normalized.includes('..')) {
    return null;
  }
  return join(uploadRoot, normalized);
}
