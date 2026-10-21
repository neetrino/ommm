import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCodeBox,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const ACCOUNT_DELETION_CODE_SUBJECT = 'Confirm account closure — Ommm';

type AccountDeletionCodeEmailParams = {
  recipientName: string;
  code: string;
  expiresInMinutes: number;
};

/** Subject + HTML for the code that confirms closing an account. */
export function buildAccountDeletionCodeEmail(
  params: AccountDeletionCodeEmailParams,
): { subject: string; html: string } {
  const html = renderBrandedEmail({
    title: 'Confirm account closure',
    preheader: 'Enter this code to close your Ommm account',
    bodyHtml: [
      renderEmailHeading('Confirm account closure'),
      renderEmailGreeting(params.recipientName),
      renderEmailText(
        'Use this code to confirm that you want to close your Ommm account. After it is closed you will be signed out.',
      ),
      renderEmailCodeBox('Closure code', params.code),
      renderEmailMutedNote(
        `This code expires in ${params.expiresInMinutes} minutes. If you did not ask to close your account, you can ignore this email.`,
      ),
      renderEmailSignoff(),
    ].join(''),
  });
  return { subject: ACCOUNT_DELETION_CODE_SUBJECT, html };
}
