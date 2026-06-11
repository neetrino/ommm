/**
 * One-off preview: sends sample payment success emails (customer + admin).
 * Usage: pnpm exec dotenv -e ../../.env -- pnpm exec tsx scripts/send-payment-test-emails.ts
 */
import { Resend } from 'resend';
import { getEmailLogoAttachment } from '../src/mail/email-logo';
import { renderPaymentAdminNotificationEmail } from '../src/mail/templates/payment-admin-notification.template';
import { renderPaymentCustomerConfirmationEmail } from '../src/mail/templates/payment-customer-confirmation.template';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() ?? '';
const FROM_NAME = process.env.RESEND_FROM?.trim() ?? 'Ommm';
const CUSTOMER_TO =
  process.env.PAYMENT_TEST_EMAIL?.trim() ??
  process.env.CONTACT_RECEIVER_EMAIL?.trim() ??
  '';
const ADMIN_TO = process.env.CONTACT_RECEIVER_EMAIL?.trim() ?? CUSTOMER_TO;

function resolveFrom(): string {
  if (FROM_EMAIL.length === 0) {
    throw new Error('RESEND_FROM_EMAIL is not set');
  }
  return `${FROM_NAME} <${FROM_EMAIL}>`;
}

async function main(): Promise<void> {
  if (RESEND_API_KEY.length === 0) {
    throw new Error('RESEND_API_KEY is not set');
  }
  if (CUSTOMER_TO.length === 0) {
    throw new Error(
      'Set CONTACT_RECEIVER_EMAIL or PAYMENT_TEST_EMAIL in .env',
    );
  }

  const resend = new Resend(RESEND_API_KEY);
  const from = resolveFrom();
  const logoAttachment = getEmailLogoAttachment();
  const confirmedAt = 'Wednesday, 11 June 2026 at 14:30';

  const customerHtml = renderPaymentCustomerConfirmationEmail({
    customerName: 'Gurgen',
    amountLabel: '25,000 ֏',
    currency: 'amd',
    paymentTypeLabel: 'Package purchase',
    confirmedAtLabel: confirmedAt,
    paymentReference: 'PKG-TEST-EMAIL-001',
  });

  const adminHtml = renderPaymentAdminNotificationEmail({
    customerName: 'Gurgen Test',
    customerEmail: CUSTOMER_TO,
    customerPhone: '+374 00 000 000',
    amountLabel: '25,000 ֏',
    currency: 'amd',
    paymentTypeLabel: 'Package purchase',
    statusLabel: 'Succeeded',
    confirmedAtLabel: confirmedAt,
    paymentId: 'test-payment-preview-id',
    paymentReference: 'PKG-TEST-EMAIL-001',
    relatedDetails: 'Monthly Flow (Yoga)',
  });

  const customerResult = await resend.emails.send({
    from,
    to: CUSTOMER_TO,
    subject: '[TEST] Your payment has been confirmed — Ommm',
    html: customerHtml,
    attachments: [logoAttachment],
  });
  if (customerResult.error) {
    throw new Error(`Customer email failed: ${customerResult.error.message}`);
  }

  const adminResult = await resend.emails.send({
    from,
    to: ADMIN_TO,
    replyTo: CUSTOMER_TO,
    subject: '[TEST] Payment successfully confirmed — Ommm',
    html: adminHtml,
    attachments: [logoAttachment],
  });
  if (adminResult.error) {
    throw new Error(`Admin email failed: ${adminResult.error.message}`);
  }

  console.log(`Customer preview sent to: ${CUSTOMER_TO}`);
  console.log(`Admin preview sent to: ${ADMIN_TO}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
