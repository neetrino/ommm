import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const CLIENT_INVITE_EMAIL_SUBJECT =
  'Welcome to Ommm — create your password';

export type ClientInviteEmailParams = {
  recipientName: string;
  passwordSetupUrl: string;
};

/** Invite email for a client account created by the studio. */
export function renderClientInviteEmail(
  params: ClientInviteEmailParams,
): string {
  return renderBrandedEmail({
    title: 'Welcome to Ommm',
    preheader: 'Create your password to activate your Ommm account',
    bodyHtml: [
      renderEmailHeading('Welcome to Ommm'),
      renderEmailGreeting(params.recipientName),
      renderEmailText(
        'The studio created an account for you at Ommm Wellness Studio. Create a password to sign in and book classes.',
      ),
      renderEmailCtaButton('Create password', params.passwordSetupUrl),
      renderEmailMutedNote(
        'This button expires for your security. If it no longer works, contact the studio and we will send a new one.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}
