import { escapeHtml, plainTextToHtml } from '../email-html.util';
import { EMAIL_LOGO_PUBLIC_SRC } from '../email-logo';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmailLayout } from './email-layout';

export type PaymentCashPendingCustomerParams = {
  customerName: string;
  amountLabel: string;
  paymentTypeLabel: string;
  paymentReference: string;
  bookingAccessNote: string;
  studioName: string;
  studioAddress: string;
  studioPhone: string;
  studioHours: string;
};

const CASH_PENDING_INTRO = `Thank you for choosing to pay in cash.

Your order has been registered in the Ommm system. To complete your payment, please visit our pilates and wellness studio in person and pay at the front desk.`;

/** Branded reminder email sent when a customer selects cash payment. */
export function renderPaymentCashPendingCustomerEmail(
  params: PaymentCashPendingCustomerParams,
): string {
  const greetingName = params.customerName.trim();
  const reference =
    params.paymentReference.trim().length > 0 ? params.paymentReference : '—';
  const studioAddress =
    params.studioAddress.trim().length > 0
      ? params.studioAddress
      : 'Please contact the studio for the visit address.';
  const studioPhone =
    params.studioPhone.trim().length > 0 ? params.studioPhone : '—';
  const studioHours =
    params.studioHours.trim().length > 0 ? params.studioHours : '—';

  const bodyHtml = `
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">Cash payment pending</h1>
<p style="margin:0 0 20px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:16px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  Hi${greetingName.length > 0 ? ` ${escapeHtml(greetingName)}` : ''},
</p>
${plainTextToHtml(CASH_PENDING_INTRO)}
<div style="margin:24px 0 0;padding:20px;border-radius:14px;background:${EMAIL_BRAND.accentBackground};">
  <p style="margin:0 0 12px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
    ${escapeHtml(params.bookingAccessNote)}
  </p>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0;padding:20px;border-radius:14px;background:${EMAIL_BRAND.background};">
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Amount due</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(params.amountLabel)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Payment type</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(params.paymentTypeLabel)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Reference</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(reference)}</td>
  </tr>
</table>
<h2 style="margin:28px 0 12px;font-size:18px;line-height:1.35;font-weight:600;color:${EMAIL_BRAND.headingColor};">Visit ${escapeHtml(params.studioName)}</h2>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};vertical-align:top;width:90px;">Address</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.55;color:${EMAIL_BRAND.headingColor};">${escapeHtml(studioAddress)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Phone</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;color:${EMAIL_BRAND.headingColor};">${escapeHtml(studioPhone)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:13px;font-weight:600;color:${EMAIL_BRAND.mutedColor};">Hours</td>
    <td style="padding:6px 0 6px 16px;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.55;color:${EMAIL_BRAND.headingColor};">${escapeHtml(studioHours)}</td>
  </tr>
</table>
<p style="margin:28px 0 0;font-family:${EMAIL_BRAND.sansFontFamily};font-size:15px;line-height:1.65;color:${EMAIL_BRAND.bodyColor};">
  With care,<br />
  The Ommm Team
</p>`;

  return renderBrandedEmailLayout({
    logoSrc: EMAIL_LOGO_PUBLIC_SRC,
    title: 'Cash payment pending',
    preheader: 'Please visit Ommm studio to complete your cash payment',
    bodyHtml,
  });
}
