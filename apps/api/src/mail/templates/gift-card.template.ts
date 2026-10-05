import {
  buildContactUrl,
  buildRegisterUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../email-app-urls';
import { escapeHtml } from '../email-html.util';
import { EMAIL_BRAND } from './email-brand.constants';
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

export const PHYSICAL_GIFT_CARD_EMAIL_SUBJECT = 'Your gift is waiting at Ommm';

/** Printed on the public site and on the physical-card pickup email. */
export const OMMM_PICKUP_ADDRESS =
  '25 Pushkin St, Yerevan, Soho Business Centre, 4th floor';

export const OMMM_PICKUP_PHONE = '+374 60 500 400';

export type GiftCardEmailParams = {
  code: string;
  accountUrl: string;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  amountLabel?: string;
  message?: string;
};

export type PhysicalGiftCardEmailParams = {
  pickupUrl: string;
  studioAddress: string;
  studioPhone: string;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  amountLabel?: string;
  message?: string;
};

/** Delivery email for a purchased or assigned gift card. */
export function renderGiftCardEmail(params: GiftCardEmailParams): string {
  return renderBrandedEmail({
    title: 'A gift for you',
    preheader: 'A gift is waiting for you at Ommm',
    bodyHtml: buildGiftCardEmailBody(params),
  });
}

function buildGiftCardEmailBody(params: GiftCardEmailParams): string {
  const sender = params.senderName?.trim() ?? '';
  const note = params.message?.trim() ?? '';
  const intro =
    sender.length > 0
      ? `${sender} is giving you a gift at Ommm. Create your account, then enter this code to add it.`
      : 'Someone is giving you a gift at Ommm. Create your account, then enter this code to add it.';
  const parts = [
    renderEmailHeading('A gift for you'),
    renderEmailGreeting(params.recipientName ?? ''),
    renderEmailText(intro),
    renderGiftSenderCard(sender, params.senderEmail?.trim() ?? ''),
    renderGiftDetailCard(params.amountLabel),
    note.length > 0 ? renderEmailQuote(note) : '',
    renderEmailCodeBox('Gift card code', params.code),
    renderEmailCtaButton('Create your account', params.accountUrl),
    renderEmailMutedNote(
      'After you create an account, open Gift cards and enter the code. Keep this code private.',
    ),
    renderEmailSignoff(),
  ];
  return parts.filter((part) => part.length > 0).join('');
}

function renderGiftDetailCard(amountLabel: string | undefined): string {
  const label = amountLabel?.trim() ?? '';
  if (label.length === 0) {
    return '';
  }
  const rows: EmailDetailRow[] = [
    { label: 'Your gift', value: `${label} to use at the studio` },
  ];
  return renderEmailDetailCard(rows);
}

/** Who gave the gift: name and surname, then their mail. */
function renderGiftSenderCard(name: string, email: string): string {
  if (name.length === 0 && email.length === 0) {
    return '';
  }
  const nameLine =
    name.length > 0
      ? `<p style="margin:0;font-family:${EMAIL_BRAND.fontFamily};font-size:20px;line-height:1.35;color:${EMAIL_BRAND.headingColor};">${escapeHtml(name)}</p>`
      : '';
  const emailLine =
    email.length > 0
      ? `<p style="margin:${name.length > 0 ? '6px' : '0'} 0 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:14px;line-height:1.4;color:${EMAIL_BRAND.mutedColor};">${escapeHtml(email)}</p>`
      : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 24px;">
  <tr>
    <td style="padding:18px 20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">
      <p style="margin:0 0 8px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_BRAND.mutedColor};">From</p>
      ${nameLine}
      ${emailLine}
    </td>
  </tr>
</table>`;
}

/** Pickup email: the code stays on the printed card, not in the inbox. */
export function renderPhysicalGiftCardEmail(
  params: PhysicalGiftCardEmailParams,
): string {
  return renderBrandedEmail({
    title: 'Your gift is waiting',
    preheader: 'Come to Ommm Wellness to collect your gift card',
    bodyHtml: buildPhysicalGiftCardEmailBody(params),
  });
}

function buildPhysicalGiftCardEmailBody(
  params: PhysicalGiftCardEmailParams,
): string {
  const sender = params.senderName?.trim() ?? '';
  const note = params.message?.trim() ?? '';
  const intro =
    sender.length > 0
      ? `${sender} gave you a gift at Ommm Wellness. Your physical card is waiting at the studio. Come in to collect it.`
      : 'You received a gift at Ommm Wellness. Your physical card is waiting at the studio. Come in to collect it.';
  const parts = [
    renderEmailHeading('A gift for you'),
    renderEmailGreeting(params.recipientName ?? ''),
    renderEmailText(intro),
    renderGiftSenderCard(sender, params.senderEmail?.trim() ?? ''),
    renderGiftDetailCard(params.amountLabel),
    note.length > 0 ? renderEmailQuote(note) : '',
    renderEmailDetailCard([
      { label: 'Collect it at', value: 'Ommm Wellness' },
      { label: 'Address', value: params.studioAddress },
      { label: 'Phone', value: params.studioPhone },
    ]),
    renderEmailCtaButton('Find the studio', params.pickupUrl),
    renderEmailMutedNote(
      'The code is printed on the card. After you collect it, create an account and enter that code under Gift cards.',
    ),
    renderEmailSignoff(),
  ];
  return parts.filter((part) => part.length > 0).join('');
}

/** Subject + HTML ready for `MailService.sendEmail`. */
export function buildGiftCardDeliveryEmail(params: {
  code: string;
  webAppUrl?: string;
  locale?: string;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  amountLabel?: string;
  message?: string;
  format?: 'DIGITAL' | 'PHYSICAL';
}): { subject: string; html: string } {
  const webAppUrl = resolveWebAppUrl(params.webAppUrl);
  const locale = resolveEmailLocale(params.locale);
  if (params.format === 'PHYSICAL') {
    return {
      subject: PHYSICAL_GIFT_CARD_EMAIL_SUBJECT,
      html: renderPhysicalGiftCardEmail({
        pickupUrl: buildContactUrl(webAppUrl, locale),
        studioAddress: OMMM_PICKUP_ADDRESS,
        studioPhone: OMMM_PICKUP_PHONE,
        recipientName: params.recipientName,
        senderName: params.senderName,
        senderEmail: params.senderEmail,
        amountLabel: params.amountLabel,
        message: params.message,
      }),
    };
  }
  return {
    subject: GIFT_CARD_EMAIL_SUBJECT,
    html: renderGiftCardEmail({
      code: params.code,
      accountUrl: buildRegisterUrl(webAppUrl, locale),
      recipientName: params.recipientName,
      senderName: params.senderName,
      senderEmail: params.senderEmail,
      amountLabel: params.amountLabel,
      message: params.message,
    }),
  };
}
