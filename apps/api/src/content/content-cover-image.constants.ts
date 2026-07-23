export const CONTENT_COVER_UPLOAD_PUBLIC_PREFIX = '/v1/uploads/';

export {
  ALLOWED_GIFT_CARD_IMAGE_MIMES as ALLOWED_CONTENT_COVER_IMAGE_MIMES,
  GIFT_CARD_IMAGE_MAX_BYTES as CONTENT_COVER_IMAGE_MAX_BYTES,
  GIFT_CARD_IMAGE_MIME_TO_EXT as CONTENT_COVER_IMAGE_MIME_TO_EXT,
  normalizeGiftCardImageMime as normalizeContentCoverImageMime,
} from '../gift-cards/gift-card-image.constants';
