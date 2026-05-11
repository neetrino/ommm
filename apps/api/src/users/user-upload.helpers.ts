import { join } from "node:path";
import { HOME_IMAGE_PUBLIC_PREFIX } from "./constants/home-image.constants";

/**
 * Returns absolute filesystem path for a stored public upload path, or null if not a local upload URL.
 */
export function absolutePathForStoredUpload(
  uploadRoot: string,
  storedPublicPath: string,
): string | null {
  if (!storedPublicPath.startsWith(HOME_IMAGE_PUBLIC_PREFIX)) {
    return null;
  }
  const relative = storedPublicPath.slice(HOME_IMAGE_PUBLIC_PREFIX.length);
  const normalized = relative.replace(/^\/+/, "");
  if (normalized.includes("..")) {
    return null;
  }
  return join(uploadRoot, normalized);
}
