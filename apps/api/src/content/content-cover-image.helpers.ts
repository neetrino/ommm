import { join } from 'node:path';
import { CONTENT_COVER_UPLOAD_PUBLIC_PREFIX } from './content-cover-image.constants';

export function absolutePathForStoredContentCoverUpload(
  uploadRoot: string,
  storedPublicPath: string,
): string | null {
  if (!storedPublicPath.startsWith(CONTENT_COVER_UPLOAD_PUBLIC_PREFIX)) {
    return null;
  }
  const relative = storedPublicPath.slice(
    CONTENT_COVER_UPLOAD_PUBLIC_PREFIX.length,
  );
  const normalized = relative.replace(/^\/+/, '');
  if (normalized.includes('..')) {
    return null;
  }
  return join(uploadRoot, normalized);
}
