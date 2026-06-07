/** Relative-path resolution base — never used for network requests. */
const RELATIVE_PATH_BASE = new URL("https://image-src.invalid");

/** Control and HTML meta chars that can break attribute context. */
const UNSAFE_SRC_CHARS = /[\u0000-\u001F\u007F<>"'`]/;

export type SanitizeImageSrcUrlOptions = {
  /** Allow `blob:` URLs (local file previews). */
  allowBlob?: boolean;
  /** Allow `http:` / `https:` absolute URLs. Default true. */
  allowRemoteHttp?: boolean;
};

/**
 * Validates and normalizes a string for safe use in `<img src>` / Next `Image`.
 * Returns null when the value is empty, malformed, or carries unsafe characters.
 */
export function sanitizeImageSrcUrl(
  src: string,
  options: SanitizeImageSrcUrlOptions = {},
): string | null {
  const { allowBlob = false, allowRemoteHttp = true } = options;
  const trimmed = src.trim();
  if (trimmed === "") {
    return null;
  }
  if (UNSAFE_SRC_CHARS.test(trimmed)) {
    return null;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    try {
      const parsed = new URL(trimmed, RELATIVE_PATH_BASE);
      if (parsed.origin !== RELATIVE_PATH_BASE.origin) {
        return null;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  }
  try {
    const url = new URL(trimmed);
    if (allowBlob && url.protocol === "blob:") {
      return url.href;
    }
    if (
      allowRemoteHttp &&
      (url.protocol === "https:" || url.protocol === "http:")
    ) {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}
