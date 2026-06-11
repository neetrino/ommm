import fs from 'node:fs';
import path from 'node:path';

const LOGO_FILENAME = 'brand-mark-email.png';
const LOGO_MIME = 'image/png';

/** CID referenced in HTML as `cid:ommm-brand-logo`. */
export const EMAIL_LOGO_CONTENT_ID = 'ommm-brand-logo';

export const EMAIL_LOGO_CID_SRC = `cid:${EMAIL_LOGO_CONTENT_ID}`;

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

/** Resend inline attachment for the Ommm logo (Gmail-safe; avoids blocked data URIs). */
export function getEmailLogoAttachment(): {
  content: Buffer;
  filename: string;
  contentType: string;
  contentId: string;
} {
  return {
    content: loadEmailLogoBuffer(),
    filename: LOGO_FILENAME,
    contentType: LOGO_MIME,
    contentId: EMAIL_LOGO_CONTENT_ID,
  };
}

/** Used only for local log transport previews in the Nest console. */
export function resolveEmailLogoPreviewSrc(): string {
  const buffer = loadEmailLogoBuffer();
  return `data:${LOGO_MIME};base64,${buffer.toString('base64')}`;
}
