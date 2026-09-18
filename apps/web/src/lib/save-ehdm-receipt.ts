const RECEIPT_PNG_PIXEL_RATIO = 2;
const RECEIPT_PNG_TYPE = "image/png";
const OBJECT_URL_REVOKE_MS = 1_000;

/** Safe PNG filename for a fiscal receipt download / share sheet. */
export function buildEhdmReceiptFileName(reference: string | null): string {
  const raw = reference?.trim() ?? "";
  const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `Ommm-receipt-${safe.length > 0 ? safe : "fiscal"}.png`;
}

export function isUserShareCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function canShareFiles(file: File): boolean {
  return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
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
  shareTitle: string;
  shareText: string;
}): Promise<"shared" | "downloaded"> {
  const fileName = buildEhdmReceiptFileName(params.reference);
  const blob = await captureNodePngBlob(params.node);
  const file = new File([blob], fileName, { type: RECEIPT_PNG_TYPE });
  if (canShareFiles(file)) {
    await navigator.share({
      files: [file],
      title: params.shareTitle,
      text: params.shareText,
    });
    return "shared";
  }
  triggerBlobDownload(blob, fileName);
  return "downloaded";
}
