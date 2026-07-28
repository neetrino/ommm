import fs from 'node:fs';
import path from 'node:path';

const LOGO_FILENAME = 'brand-mark-email.png';
const LOGO_MIME = 'image/png';

/**
 * Public HTTPS logo for transactional emails (hosted on R2).
 * Hardcoded intentionally — public asset URL, not a secret; Mail.ru/webmail need HTTPS, not CID.
 */
export const EMAIL_LOGO_PUBLIC_SRC =
  'https://pub-33c692c145554c4fb3324f94c43f2319.r2.dev/email/brand-mark-email.png';

let cachedLogoBuffer: Buffer | null = null;

function resolveLogoFilePath(): string {
  const candidates = [
    path.join(__dirname, 'assets', LOGO_FILENAME),
    path.join(process.cwd(), 'src/mail/assets', LOGO_FILENAME),
    path.join(process.cwd(), 'apps/api/src/mail/assets', LOGO_FILENAME),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Ommm email logo asset not found');
}

function loadEmailLogoBuffer(): Buffer {
  if (cachedLogoBuffer !== null) {
    return cachedLogoBuffer;
  }

  cachedLogoBuffer = fs.readFileSync(resolveLogoFilePath());
  return cachedLogoBuffer;
}

/** Used only for local log transport previews in the Nest console. */
export function resolveEmailLogoPreviewSrc(): string {
  const buffer = loadEmailLogoBuffer();
  return `data:${LOGO_MIME};base64,${buffer.toString('base64')}`;
}
