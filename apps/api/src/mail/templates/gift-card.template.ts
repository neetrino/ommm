import {
  buildMemberGiftCardsUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../email-app-urls';
import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCodeBox,
  renderEmailCtaButton,
  renderEmailDetailCard,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailMutedNote,
  renderEmailQuote,
  renderEmailSignoff,
  renderEmailText,
  type EmailDetailRow,
} from './email-parts';

export const GIFT_CARD_EMAIL_SUBJECT = 'A gift for you — Ommm';

export type GiftCardEmailParams = {
  code: string;
  accountUrl: string;
  recipientName?: string;
  senderName?: string;
  amountLabel?: string;
  message?: string;
};

/** Delivery email for a purchased or assigned gift card. */
export function renderGiftCardEmail(params: GiftCardEmailParams): string {
  return renderBrandedEmail({
    title: 'A gift for you',
    preheader: 'A gift card is waiting in your Ommm account',
    bodyHtml: buildGiftCardEmailBody(params),
  });
}

function buildGiftCardEmailBody(params: GiftCardEmailParams): string {
  const sender = params.senderName?.trim() ?? '';
  const note = params.message?.trim() ?? '';
  const intro =
    sender.length > 0
      ? `${sender} sent you an Ommm gift card. It is already waiting in your account.`
      : 'Someone sent you an Ommm gift card. It is already waiting in your account.';
  const parts = [
    renderEmailHeading('A gift for you'),
    renderEmailGreeting(params.recipientName ?? ''),
    renderEmailText(intro),
    renderGiftDetailCard(params.amountLabel, sender),
    note.length > 0 ? renderEmailQuote(note) : '',
    renderEmailCodeBox('Gift card code', params.code),
    renderEmailCtaButton('Open my gift cards', params.accountUrl),
    renderEmailMutedNote(
      'The balance is already on your account. Keep this code private.',
    ),
    renderEmailSignoff(),
  ];
  return parts.filter((part) => part.length > 0).join('');
}

function renderGiftDetailCard(
  amountLabel: string | undefined,
  sender: string,
): string {
  const rows: EmailDetailRow[] = [];
  if (amountLabel && amountLabel.trim().length > 0) {
    rows.push({ label: 'Amount', value: amountLabel.trim() });
  }
  if (sender.length > 0) {
    rows.push({ label: 'From', value: sender });
  }
  return rows.length > 0 ? renderEmailDetailCard(rows) : '';
}

/** Subject + HTML ready for `MailService.sendEmail`. */
export function buildGiftCardDeliveryEmail(params: {
  code: string;
  webAppUrl?: string;
  locale?: string;
  recipientName?: string;
  senderName?: string;
  amountLabel?: string;
  message?: string;
}): { subject: string; html: string } {
  return {
    subject: GIFT_CARD_EMAIL_SUBJECT,
    html: renderGiftCardEmail({
      code: params.code,
      accountUrl: buildMemberGiftCardsUrl(
        resolveWebAppUrl(params.webAppUrl),
        resolveEmailLocale(params.locale),
      ),
      recipientName: params.recipientName,
      senderName: params.senderName,
      amountLabel: params.amountLabel,
      message: params.message,
    }),
  };
}
