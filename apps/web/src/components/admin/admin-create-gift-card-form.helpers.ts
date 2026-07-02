export const ADMIN_GIFT_CARD_FORM_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ADMIN_GIFT_CARD_FORM_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ADMIN_GIFT_CARD_FORM_IMAGE_PREVIEW_MAX_WIDTH = 288;
export const ADMIN_GIFT_CARD_FORM_IMAGE_PREVIEW_MAX_HEIGHT = 192;

export function isAcceptedGiftCardImageType(
  type: string,
): type is (typeof ADMIN_GIFT_CARD_FORM_ACCEPTED_IMAGE_TYPES)[number] {
  return ADMIN_GIFT_CARD_FORM_ACCEPTED_IMAGE_TYPES.some((acceptedType) => acceptedType === type);
}

export async function createGiftCardImagePreviewDataUrl(file: File): Promise<string> {
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(
      ADMIN_GIFT_CARD_FORM_IMAGE_PREVIEW_MAX_WIDTH / image.width,
      ADMIN_GIFT_CARD_FORM_IMAGE_PREVIEW_MAX_HEIGHT / image.height,
      1,
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("Image preview canvas is unavailable");
    }
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    image.close();
  }
}
