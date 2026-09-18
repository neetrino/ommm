const RECEIPT_PNG_PIXEL_RATIO = 2;
const RECEIPT_PNG_TYPE = "image/png";
const OBJECT_URL_REVOKE_MS = 1_000;

/** Safe PNG filename for a fiscal receipt download. */
export function buildEhdmReceiptFileName(reference: string | null): string {
  const raw = reference?.trim() ?? "";
  const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `Ommm-receipt-${safe.length > 0 ? safe : "fiscal"}.png`;
}

/**
 * Direct file install — never `navigator.share` (that opens OS Share on
 * Windows/Android/iOS). Same `<a download>` path on phone and desktop.
 */
export function downloadReceiptBlob(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(href);
  }, OBJECT_URL_REVOKE_MS);
}

export async function captureNodePngBlob(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  const blob = await toBlob(node, {
    pixelRatio: RECEIPT_PNG_PIXEL_RATIO,
    backgroundColor: "#ffffff",
    cacheBust: true,
    type: RECEIPT_PNG_TYPE,
  });
  if (!blob) {
    throw new Error("Receipt PNG capture returned empty");
  }
  return blob;
}

export async function saveEhdmReceiptPng(params: {
  node: HTMLElement;
  reference: string | null;
}): Promise<void> {
  const fileName = buildEhdmReceiptFileName(params.reference);
  const blob = await captureNodePngBlob(params.node);
  downloadReceiptBlob(blob, fileName);
}
