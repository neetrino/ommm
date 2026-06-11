import { Resend } from 'resend';
import { getEmailLogoAttachment } from '../src/mail/email-logo';
import { renderPaymentAdminNotificationEmail } from '../src/mail/templates/payment-admin-notification.template';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() ?? '';
const FROM_NAME = process.env.RESEND_FROM?.trim() ?? 'Ommm';
const ADMIN_TO = process.env.CONTACT_RECEIVER_EMAIL?.trim() ?? '';

async function main(): Promise<void> {
  if (!RESEND_API_KEY || !FROM_EMAIL || !ADMIN_TO) {
    throw new Error('Missing RESEND_API_KEY, RESEND_FROM_EMAIL, or CONTACT_RECEIVER_EMAIL');
  }

  const resend = new Resend(RESEND_API_KEY);
  const html = renderPaymentAdminNotificationEmail({
    customerName: 'Gurgen Test',
    customerEmail: ADMIN_TO,
    customerPhone: '+374 00 000 000',
    amountLabel: '25,000 ֏',
    currency: 'amd',
    paymentTypeLabel: 'Package purchase',
    statusLabel: 'Succeeded',
    confirmedAtLabel: 'Wednesday, 11 June 2026 at 14:30',
    paymentId: 'test-payment-preview-id',
    paymentReference: 'PKG-TEST-EMAIL-001',
    relatedDetails: 'Monthly Flow (Yoga)',
  });

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: ADMIN_TO,
    replyTo: ADMIN_TO,
    subject: '[TEST] Payment successfully confirmed — Ommm (Admin)',
    html,
    attachments: [getEmailLogoAttachment()],
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  console.log(`Admin preview sent to: ${ADMIN_TO}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
