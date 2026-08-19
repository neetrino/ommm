import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const VERIFY_EMAIL_SUBJECT = 'Confirm your email — Ommm';
export const RESET_PASSWORD_SUBJECT = 'Reset your password — Ommm';
export const CREATE_PASSWORD_SUBJECT = 'Create your password — Ommm';

export type AuthLinkEmailParams = {
  recipientName: string;
  actionUrl: string;
};

export type AuthEmailMessage = {
  subject: string;
  html: string;
};

function buildAuthEmailMessage(
  subject: string,
  html: string,
): AuthEmailMessage {
  return { subject, html };
}

/** Email-verify message after self-registration. */
export function renderVerifyEmail(params: AuthLinkEmailParams): string {
  return renderBrandedEmail({
    title: 'Confirm your email',
    preheader: 'Confirm your email to finish setting up your account',
    bodyHtml: [
      renderEmailHeading('Confirm your email'),
      renderEmailGreeting(params.recipientName),
      renderEmailText(
        'Please confirm this email address to finish setting up your Ommm account.',
      ),
      renderEmailCtaButton('Confirm email', params.actionUrl),
      renderEmailMutedNote(
        'This button expires for your security. If it no longer works, register again or contact the studio.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}

/** Subject + HTML for account email verification. */
export function buildVerifyEmailMessage(
  params: AuthLinkEmailParams,
): AuthEmailMessage {
  return buildAuthEmailMessage(VERIFY_EMAIL_SUBJECT, renderVerifyEmail(params));
}

/** Password-reset message for members who already have a password. */
export function renderResetPasswordEmail(params: AuthLinkEmailParams): string {
  return renderBrandedEmail({
    title: 'Reset your password',
    preheader: 'Choose a new password for your Ommm account',
    bodyHtml: [
      renderEmailHeading('Reset your password'),
      renderEmailGreeting(params.recipientName),
      renderEmailText(
        'We received a request to reset the password for your Ommm account. If this was you, tap the button below.',
      ),
      renderEmailCtaButton('Reset password', params.actionUrl),
      renderEmailMutedNote(
        'If you did not ask for this, you can ignore this email. The button expires for your security.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}

/** Subject + HTML for password reset. */
export function buildResetPasswordEmailMessage(
  params: AuthLinkEmailParams,
): AuthEmailMessage {
  return buildAuthEmailMessage(
    RESET_PASSWORD_SUBJECT,
    renderResetPasswordEmail(params),
  );
}

/** First password for accounts that were created without one. */
export function renderCreatePasswordEmail(params: AuthLinkEmailParams): string {
  return renderBrandedEmail({
    title: 'Create your password',
    preheader: 'Create a password to start booking at Ommm',
    bodyHtml: [
      renderEmailHeading('Create your password'),
      renderEmailGreeting(params.recipientName),
      renderEmailText(
        'Create a password to sign in to your Ommm account and start booking classes.',
      ),
      renderEmailCtaButton('Create password', params.actionUrl),
      renderEmailMutedNote(
        'This button expires for your security. If it no longer works, contact the studio and we will send a new one.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}

/** Subject + HTML for first-time password setup. */
export function buildCreatePasswordEmailMessage(
  params: AuthLinkEmailParams,
): AuthEmailMessage {
  return buildAuthEmailMessage(
    CREATE_PASSWORD_SUBJECT,
    renderCreatePasswordEmail(params),
  );
}
