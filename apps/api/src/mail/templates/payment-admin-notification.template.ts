import { escapeHtml } from '../email-html.util';
import { EMAIL_BRAND } from './email-brand.constants';
import { renderBrandedEmail, renderInfoRows } from './email-layout';
import { renderEmailHeading, renderEmailText } from './email-parts';

export const PAYMENT_ADMIN_EMAIL_SUBJECT = 'New payment received — Ommm';

export type PaymentAdminNotificationParams = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountLabel: string;
  paymentTypeLabel: string;
  statusLabel: string;
  confirmedAtLabel: string;
};

/** Payment notice sent to the studio inbox. */
export function renderPaymentAdminNotificationEmail(
  params: PaymentAdminNotificationParams,
): string {
  const customerName = params.customerName.trim();
  const phone =
    params.customerPhone.trim().length > 0 ? params.customerPhone : '—';
  const safeEmail = escapeHtml(params.customerEmail);

  return renderBrandedEmail({
    title: 'Payment received',
    preheader: `Payment received from ${customerName || params.customerEmail}`,
    bodyHtml: [
      renderEmailHeading('Payment received'),
      renderEmailText('A client payment was received. Details are below.'),
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 0;">
  ${renderInfoRows([
    {
      label: 'Client',
      value: escapeHtml(customerName.length > 0 ? customerName : '—'),
    },
    {
      label: 'Email',
      value: `<a href="mailto:${safeEmail}" style="color:${EMAIL_BRAND.accentColor};text-decoration:none;">${safeEmail}</a>`,
    },
    { label: 'Phone', value: escapeHtml(phone) },
    { label: 'Amount', value: escapeHtml(params.amountLabel) },
    { label: 'For', value: escapeHtml(params.paymentTypeLabel) },
    { label: 'Status', value: escapeHtml(params.statusLabel) },
    { label: 'Paid on', value: escapeHtml(params.confirmedAtLabel) },
  ])}
</table>`,
    ].join(''),
  });
}
