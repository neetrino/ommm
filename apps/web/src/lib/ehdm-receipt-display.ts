import { formatDateTimeForUi } from "@/lib/date-display";

const QR_IMAGE_SIZE = 120;

/** PEC `qr` is a text payload — encode it; never treat it as a URL. */
export function buildEhdmQrImageUrl(qrText: string): string | null {
  const payload = qrText.replace(/\s/g, "").trim();
  if (payload.length === 0) {
    return null;
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_IMAGE_SIZE}x${QR_IMAGE_SIZE}&data=${encodeURIComponent(payload)}`;
}

export function formatEhdmReceiptTime(
  unixMs: number | null,
  locale?: string,
): string {
  if (unixMs == null || !Number.isFinite(unixMs)) {
    return "";
  }
  return formatDateTimeForUi(new Date(unixMs), locale);
}
