const DEFAULT_API_ORIGIN = "http://localhost:4000";

/**
 * Browser-facing API origin for SSE (direct connection — not Next `/api/v1` rewrite).
 * Prefers `NEXT_PUBLIC_API_ORIGIN`; falls back to existing `NEXT_PUBLIC_API_URL`.
 */
export function resolvePublicApiOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    DEFAULT_API_ORIGIN;
  return raw.replace(/\/$/, "");
}
