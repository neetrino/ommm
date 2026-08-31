import { PaymentSource } from '@prisma/client';
import {
  formatWhatsappAmount,
  formatWhatsappPaymentSource,
  resolveWhatsappLocale,
} from './whatsapp-locale';

describe('whatsapp-locale', () => {
  it('falls back to Armenian', () => {
    expect(resolveWhatsappLocale(undefined)).toBe('hy');
    expect(resolveWhatsappLocale('fr')).toBe('hy');
  });

  it('localizes payment sources', () => {
    expect(formatWhatsappPaymentSource('hy', PaymentSource.PACKAGE)).toBe(
      'Դասի փաթեթ',
    );
    expect(formatWhatsappPaymentSource('ru', PaymentSource.DROPIN)).toBe(
      'Разовое занятие',
    );
    expect(formatWhatsappPaymentSource('en', PaymentSource.GIFT)).toBe(
      'Gift card',
    );
  });

  it('formats AMD amounts with the client locale', () => {
    expect(formatWhatsappAmount('hy', 25000, 'amd')).toContain('֏');
    expect(formatWhatsappAmount('hy', 25000, 'amd')).toContain('25');
  });
});
