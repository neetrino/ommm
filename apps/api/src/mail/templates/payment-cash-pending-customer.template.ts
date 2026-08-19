import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailDetailCard,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const CASH_PENDING_EMAIL_SUBJECT = 'Please pay at the studio — Ommm';

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
  accountUrl: string;
};

/** Reminder when a customer chooses to pay in cash at the studio. */
export function renderPaymentCashPendingCustomerEmail(
  params: PaymentCashPendingCustomerParams,
): string {
  const studioName = params.studioName.trim() || 'Ommm';
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

  return renderBrandedEmail({
    title: 'Please pay at the studio',
    preheader: 'Visit the studio to finish your cash payment',
    bodyHtml: [
      renderEmailHeading('Please pay at the studio'),
      renderEmailGreeting(params.customerName),
      renderEmailText(
        'Your order is saved. Please visit the studio and pay at the front desk to finish this payment.',
      ),
      renderEmailText(params.bookingAccessNote),
      renderEmailDetailCard([
        { label: 'Amount due', value: params.amountLabel },
        { label: 'For', value: params.paymentTypeLabel },
        { label: 'Order number', value: reference },
        { label: 'Studio', value: studioName },
        { label: 'Address', value: studioAddress },
        { label: 'Phone', value: studioPhone },
        { label: 'Opening hours', value: studioHours },
      ]),
      renderEmailCtaButton('Open my account', params.accountUrl),
      renderEmailSignoff(),
    ].join(''),
  });
}
