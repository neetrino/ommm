import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export type WaitlistOfferEmailParams = {
  className: string;
  offerMinutes: number;
  waitlistsUrl: string;
};

export type WaitlistUpdateEmailParams = {
  className: string;
  message: string;
  waitlistsUrl: string;
};

/** Subject when a waitlist place opens for a named class. */
export function buildWaitlistOfferSubject(className: string): string {
  return `A place opened in ${className} — Ommm`;
}

/** Subject for a studio-written waitlist note. */
export function buildWaitlistUpdateSubject(className: string): string {
  return `A message about ${className} — Ommm`;
}

/** Offer email when a booked place frees up. */
export function renderWaitlistOfferEmail(
  params: WaitlistOfferEmailParams,
): string {
  const className = params.className.trim() || 'your class';
  return renderBrandedEmail({
    title: 'A place opened',
    preheader: `A place opened in ${className}`,
    bodyHtml: [
      renderEmailHeading('A place opened'),
      renderEmailText(
        `A place opened in ${className}. You have ${params.offerMinutes} minutes to book it before it goes to the next person.`,
      ),
      renderEmailCtaButton('Book this class', params.waitlistsUrl),
      renderEmailMutedNote(
        'If the time runs out, we will offer the place to the next person on the list.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}

/** Manual studio message about a waitlist entry. */
export function renderWaitlistUpdateEmail(
  params: WaitlistUpdateEmailParams,
): string {
  const className = params.className.trim() || 'your class';
  const message = params.message.trim();
  const note = message.length > 0 ? renderEmailText(message) : '';

  return renderBrandedEmail({
    title: `Update about ${className}`,
    preheader: `A message about ${className}`,
    bodyHtml: [
      renderEmailHeading(`Update about ${className}`),
      renderEmailText(`There is an update about your place in ${className}.`),
      note,
      renderEmailCtaButton('Open my waitlist', params.waitlistsUrl),
      renderEmailSignoff(),
    ].join(''),
  });
}

/** Keeps a studio-written subject when one is provided. */
export function resolveWaitlistUpdateSubject(
  customSubject: string | undefined,
  className: string,
): string {
  const trimmed = customSubject?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : buildWaitlistUpdateSubject(className);
}
