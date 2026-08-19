import { renderVerifyEmail } from './auth-emails.template';
import { renderBroadcastEmail } from './broadcast.template';
import { renderClassCancelledEmail } from './class-cancelled.template';
import { renderClassReminderEmail } from './class-reminder.template';
import { renderClientInviteEmail } from './client-invite.template';
import { renderGiftCardEmail } from './gift-card.template';
import { renderPaymentAdminNotificationEmail } from './payment-admin-notification.template';
import { renderPaymentCashPendingCustomerEmail } from './payment-cash-pending-customer.template';
import { renderPaymentCustomerConfirmationEmail } from './payment-customer-confirmation.template';
import {
  renderWaitlistOfferEmail,
  renderWaitlistUpdateEmail,
} from './waitlist-emails.template';

const SAMPLE_URL = 'https://ommm.example/en/user/dashboard';

function visibleText(html: string): string {
  return html
    .replace(/\s(?:href|src)="[^"]*"/g, '')
    .replace(/url\([^)]*\)/g, '');
}

describe('branded email templates', () => {
  const samples = [
    renderVerifyEmail({ recipientName: 'Jasmine', actionUrl: SAMPLE_URL }),
    renderClientInviteEmail({
      recipientName: 'Jasmine',
      passwordSetupUrl: SAMPLE_URL,
    }),
    renderPaymentCustomerConfirmationEmail({
      customerName: 'Jasmine',
      amountLabel: '25,000 ֏',
      paymentTypeLabel: 'Class package',
      confirmedAtLabel: 'Wednesday, 19 August 2026 at 15:47',
      accountUrl: SAMPLE_URL,
    }),
    renderPaymentAdminNotificationEmail({
      customerName: 'Jasmine',
      customerEmail: 'jasmine@example.com',
      customerPhone: '+374 11 000000',
      amountLabel: '25,000 ֏',
      paymentTypeLabel: 'Class package',
      statusLabel: 'Paid',
      confirmedAtLabel: 'Wednesday, 19 August 2026 at 15:47',
    }),
    renderPaymentCashPendingCustomerEmail({
      customerName: 'Jasmine',
      amountLabel: '12,000 ֏',
      paymentTypeLabel: 'Single class',
      paymentReference: 'CASH-1042',
      bookingAccessNote: 'Your class is reserved.',
      studioName: 'Ommm',
      studioAddress: 'Yerevan',
      studioPhone: '+374 11 000000',
      studioHours: 'Mon–Sat 08:00–21:00',
      accountUrl: SAMPLE_URL,
    }),
    renderGiftCardEmail({ code: 'OMMM-4821', accountUrl: SAMPLE_URL }),
    renderWaitlistOfferEmail({
      className: 'Yoga Flow',
      offerMinutes: 30,
      waitlistsUrl: SAMPLE_URL,
    }),
    renderWaitlistUpdateEmail({
      className: 'Yoga Flow',
      message: 'We held your place a little longer.',
      waitlistsUrl: SAMPLE_URL,
    }),
    renderClassReminderEmail({
      className: 'Yoga Flow',
      hoursBefore: 2,
      startsAtLabel: 'Thursday, 20 August 2026 at 10:00',
      bookingsUrl: SAMPLE_URL,
    }),
    renderClassCancelledEmail({
      className: 'Yoga Flow',
      startsAtLabel: 'Thursday, 20 August 2026 at 10:00',
      scheduleUrl: SAMPLE_URL,
    }),
    renderBroadcastEmail(
      'Studio news',
      '<p>New morning classes this week.</p>',
    ),
  ];

  it('uses the branded studio shell', () => {
    for (const html of samples) {
      expect(html).toContain('Ommm Wellness Studio');
      expect(html).toContain('<!DOCTYPE html>');
    }
  });

  it('does not show raw http links in visible text', () => {
    for (const html of samples) {
      expect(visibleText(html)).not.toMatch(/https?:\/\//);
    }
  });

  it('renders CTAs as buttons, not pasted URLs', () => {
    expect(samples[0]).toContain('Confirm email');
    expect(samples[2]).toContain('Open my account');
    expect(samples[5]).toContain('Open my gift cards');
    expect(samples[6]).toContain('Book this class');
    expect(samples[7]).toContain('Open my waitlist');
    expect(samples[9]).toContain('Open schedule');
    expect(samples[0]).not.toContain('copy and paste this link');
  });

  it('renders a class-cancelled CTA without visible URLs', () => {
    const html = renderClassCancelledEmail({
      className: 'Yoga Flow',
      startsAtLabel: 'Thursday, 20 August 2026 at 10:00',
      scheduleUrl: SAMPLE_URL,
    });
    expect(html).toContain('Ommm Wellness Studio');
    expect(html).toContain('Open schedule');
    expect(html).toContain('This class was cancelled');
    expect(visibleText(html)).not.toMatch(/https?:\/\//);
    expect(visibleText(html)).not.toMatch(/\bFrom\b/);
  });

  it('does not attribute a studio sender', () => {
    expect(visibleText(samples[7])).not.toMatch(/\bFrom\b/);
  });
});
