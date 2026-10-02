import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";

/** Studio gift-card face served from the web app, not an uploaded API file. */
export const DEFAULT_GIFT_CARD_IMAGE_SRC = "/gift-cards/ommm-gift-card-face.jpg?v=2";

/**
 * Custom upload when present, otherwise the shared gift-card artwork.
 * Valid blob URLs are kept for in-browser previews.
 */
export function resolveGiftCardDisplaySrc(
  imageUrl: string | null | undefined,
): string {
  const trimmed = imageUrl?.trim() ?? "";
  if (trimmed.length === 0) {
    return DEFAULT_GIFT_CARD_IMAGE_SRC;
  }
  const localPreview = sanitizeImageSrcUrl(trimmed, {
    allowBlob: true,
    allowRemoteHttp: false,
  });
  if (localPreview !== null) {
    return localPreview;
  }
  const remote = resolveApiAssetUrl(trimmed);
  const safe = remote !== undefined ? sanitizeImageSrcUrl(remote) : null;
  return safe !== null ? encodeURI(safe) : DEFAULT_GIFT_CARD_IMAGE_SRC;
}
