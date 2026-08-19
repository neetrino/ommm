import {
  buildMemberGiftCardsUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../email-app-urls';
import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCodeBox,
  renderEmailCtaButton,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const GIFT_CARD_EMAIL_SUBJECT = 'Your Ommm gift card';

export type GiftCardEmailParams = {
  code: string;
  accountUrl: string;
};

/** Delivery email for a purchased or assigned gift card. */
export function renderGiftCardEmail(params: GiftCardEmailParams): string {
  return renderBrandedEmail({
    title: 'Your Ommm gift card',
    preheader: 'Your gift card is ready to use at Ommm',
    bodyHtml: [
      renderEmailHeading('A gift for you'),
      renderEmailText(
        'Someone sent you an Ommm gift card. Use this code in your account when you book or pay.',
      ),
      renderEmailCodeBox('Gift card code', params.code),
      renderEmailCtaButton('Open my gift cards', params.accountUrl),
      renderEmailMutedNote(
        'Keep this code private. The studio can help if you need a new copy of this email.',
      ),
      renderEmailSignoff(),
    ].join(''),
  });
}

/** Subject + HTML ready for `MailService.sendEmail`. */
export function buildGiftCardDeliveryEmail(params: {
  code: string;
  webAppUrl?: string;
  locale?: string;
}): { subject: string; html: string } {
  return {
    subject: GIFT_CARD_EMAIL_SUBJECT,
    html: renderGiftCardEmail({
      code: params.code,
      accountUrl: buildMemberGiftCardsUrl(
        resolveWebAppUrl(params.webAppUrl),
        resolveEmailLocale(params.locale),
      ),
    }),
  };
}
