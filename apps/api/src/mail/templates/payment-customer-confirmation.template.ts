import { renderBrandedEmail } from './email-layout';
import {
  renderEmailCtaButton,
  renderEmailDetailCard,
  renderEmailGreeting,
  renderEmailHeading,
  renderEmailSignoff,
  renderEmailText,
} from './email-parts';

export const PAYMENT_CUSTOMER_EMAIL_SUBJECT =
  'Your payment is confirmed — Ommm';

export type PaymentCustomerConfirmationParams = {
  customerName: string;
  amountLabel: string;
  paymentTypeLabel: string;
  confirmedAtLabel: string;
  accountUrl: string;
};

/** Payment confirmation sent to the paying customer. */
export function renderPaymentCustomerConfirmationEmail(
  params: PaymentCustomerConfirmationParams,
): string {
  return renderBrandedEmail({
    title: 'Payment confirmed',
    preheader: 'Your payment is confirmed',
    bodyHtml: [
      renderEmailHeading('Payment confirmed'),
      renderEmailGreeting(params.customerName),
      renderEmailText(
        'Thank you. Your payment is confirmed, and you can keep using your class, package, or gift card as usual.',
      ),
      renderEmailDetailCard([
        { label: 'Amount', value: params.amountLabel },
        { label: 'For', value: params.paymentTypeLabel },
        { label: 'Paid on', value: params.confirmedAtLabel },
      ]),
      renderEmailCtaButton('Open my account', params.accountUrl),
      renderEmailSignoff(),
    ].join(''),
  });
}
