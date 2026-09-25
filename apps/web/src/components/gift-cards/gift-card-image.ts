import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";

/** Studio gift-card face served from the web app, not an uploaded API file. */
export const DEFAULT_GIFT_CARD_IMAGE_SRC = "/gift-cards/ommm-gift-card.jpg";

/**
 * Custom upload when present, otherwise the shared gift-card artwork.
 * Blob and data URLs are kept for in-browser previews.
 */
export function resolveGiftCardDisplaySrc(
  imageUrl: string | null | undefined,
): string {
  const trimmed = imageUrl?.trim() ?? "";
  if (trimmed.length === 0) {
    return DEFAULT_GIFT_CARD_IMAGE_SRC;
  }
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const remote = resolveApiAssetUrl(trimmed);
  const safe = remote !== undefined ? sanitizeImageSrcUrl(remote) : null;
  return safe !== null ? encodeURI(safe) : DEFAULT_GIFT_CARD_IMAGE_SRC;
}
