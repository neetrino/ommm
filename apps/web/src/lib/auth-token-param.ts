/** Decodes a `[token]` route segment from email links; tolerates malformed escapes. */
export function decodeTokenSegment(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

/** Reads a single `?token=`-style search param value. */
export function readTokenQueryParam(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }
  return "";
}
