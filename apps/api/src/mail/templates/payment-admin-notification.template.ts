import { escapeHtml, plainTextToHtml } from '../email-html.util';
import { EMAIL_LOGO_CID_SRC } from '../email-logo';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmailLayout, renderInfoRows } from './email-layout';

export type PaymentAdminNotificationParams = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountLabel: string;
  currency: string;
  paymentTypeLabel: string;
  statusLabel: string;
  confirmedAtLabel: string;
  paymentId: string;
  paymentReference: string;
  relatedDetails: string;
};

const ADMIN_INTRO = `A payment has been successfully confirmed in the Ommm system.

Please review the payment details below for your records.`;

/** Branded payment success notification sent to the studio admin inbox. */
export function renderPaymentAdminNotificationEmail(
  params: PaymentAdminNotificationParams,
): string {
  const reference =
    params.paymentReference.trim().length > 0
      ? params.paymentReference
      : params.paymentId;
  const phone =
    params.customerPhone.trim().length > 0 ? params.customerPhone : '—';
  const relatedDetails =
    params.relatedDetails.trim().length > 0 ? params.relatedDetails : '—';

  const bodyHtml = `
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${EMAIL_BRAND.headingColor};">Payment Successfully Confirmed</h1>
${plainTextToHtml(ADMIN_INTRO)}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0;">
  ${renderInfoRows([
    {
      label: 'Customer',
      value: escapeHtml(
        params.customerName.trim().length > 0 ? params.customerName : '—',
      ),
    },
    {
      label: 'Email',
      value: `<a href="mailto:${escapeHtml(params.customerEmail)}" style="color:${EMAIL_BRAND.accentColor};text-decoration:none;">${escapeHtml(params.customerEmail)}</a>`,
    },
    { label: 'Phone', value: escapeHtml(phone) },
    { label: 'Amount', value: escapeHtml(params.amountLabel) },
    { label: 'Currency', value: escapeHtml(params.currency.toUpperCase()) },
    { label: 'Payment type', value: escapeHtml(params.paymentTypeLabel) },
    { label: 'Status', value: escapeHtml(params.statusLabel) },
    {
      label: 'Confirmed at',
      value: escapeHtml(params.confirmedAtLabel),
    },
    { label: 'Reference', value: escapeHtml(reference) },
    { label: 'Payment ID', value: escapeHtml(params.paymentId) },
    { label: 'Related details', value: escapeHtml(relatedDetails) },
  ])}
</table>`;

  return renderBrandedEmailLayout({
    logoSrc: EMAIL_LOGO_CID_SRC,
    title: 'Payment Successfully Confirmed',
    preheader: `Payment confirmed for ${params.customerName || params.customerEmail}`,
    bodyHtml,
  });
}
