import {
  formatPaymentDateTime,
  PAYMENT_EMAIL_TIMEZONE,
} from './payment-email-format.util';

describe('formatPaymentDateTime', () => {
  it('formats confirmed time in studio timezone', () => {
    const label = formatPaymentDateTime(new Date('2026-06-11T12:30:00.000Z'));

    expect(PAYMENT_EMAIL_TIMEZONE).toBe('Asia/Yerevan');
    expect(label).toContain('16:30');
    expect(label).not.toContain('GMT');
  });
});
