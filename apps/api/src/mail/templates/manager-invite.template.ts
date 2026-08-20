import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const MANAGER_INVITE_EMAIL_SUBJECT =
  'Ommm manager access — create your password';

export type ManagerInviteEmailParams = {
  recipientName: string;
  passwordSetupUrl: string;
};

/** Invite email for a manager account created by an admin. */
export function renderManagerInviteEmail(
  params: ManagerInviteEmailParams,
): string {
  return renderBrandedEmail({
    title: 'Ommm manager access',
    preheader: 'Create your password to open the manager workspace',
    bodyHtml: [
      renderEmailHeading('You have manager access at Ommm'),
      renderEmailGreeting(params.recipientName),
      renderEmailText(
        'An administrator created a manager account for you at Ommm Wellness Studio. Create a password to sign in to the manager workspace.',
      ),
      renderEmailCtaButton('Create password', params.passwordSetupUrl),
      renderEmailMutedNote(
        'This button expires for your security. If it no longer works, ask an administrator to send a new invite.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}
