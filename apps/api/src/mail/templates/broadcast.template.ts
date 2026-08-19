import { renderBrandedEmail } from './email-layout';

/** Wraps studio broadcast HTML in the branded shell when it is not already a full page. */
export function renderBroadcastEmail(
  subject: string,
  bodyHtml: string,
): string {
  const trimmed = bodyHtml.trim();
  if (isFullHtmlDocument(trimmed)) {
    return bodyHtml;
  }

  const title = subject.trim() || 'A message from Ommm';
  return renderBrandedEmail({
    title,
    preheader: title,
    bodyHtml: trimmed.length > 0 ? trimmed : '<p>Hello from Ommm.</p>',
  });
}

function isFullHtmlDocument(html: string): boolean {
  return /^<!DOCTYPE/i.test(html) || /^<html[\s>]/i.test(html);
}
