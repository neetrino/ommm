import { escapeHtml, plainTextToHtml } from '../email-html.util';
import { EMAIL_LOGO_CID_SRC } from '../email-logo';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmailLayout } from './email-layout';

export type PaymentCustomerConfirmationParams = {
  customerName: string;
  amountLabel: string;
  currency: string;
  paymentTypeLabel: string;
  confirmedAtLabel: string;
  paymentReference: string;
};

const CONFIRMATION_BODY = `Thank you for your payment.

Your payment has been successfully confirmed. We are happy to have you as part of the Ommm community.

Ommm is a wellness studio created for mindful movement, balance, and a calmer daily rhythm. Through yoga, pilates, reformer sessions, and carefully designed studio experiences, we help our community reconnect with their body, energy, and inner clarity.

You can now continue using your selected service according to your booking, package, or gift card details.`;

/** Branded payment confirmation email sent to the paying customer. */
export function renderPaymentCustomerConfirmationEmail(
  params: PaymentCustomerConfirmationParams,
): string {
  const greetingName = params.customerName.trim();
  const reference =
    params.paymentReference.trim().length > 0 ? params.paymentReference : '—';

  const bodyHtml = `
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">Payment Confirmed</h1>
<p style="margin:0 0 20px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Hi${greetingName.length > 0 ? ` ${escapeHtml(greetingName)}` : ''},
</p>
${plainTextToHtml(CONFIRMATION_BODY)}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0;padding:20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Amount</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(params.amountLabel)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Currency</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(params.currency.toUpperCase())}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Payment type</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(params.paymentTypeLabel)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Confirmed at</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(params.confirmedAtLabel)} (UTC)</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Reference</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(reference)}</td>
  </tr>
</table>
<p style="margin:28px 0 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  With care,<br />
  The Ommm Team
</p>`;

  return renderBrandedEmailLayout({
    logoSrc: EMAIL_LOGO_CID_SRC,
    title: 'Payment Confirmed',
    preheader: 'Your payment has been confirmed',
    bodyHtml,
  });
}
