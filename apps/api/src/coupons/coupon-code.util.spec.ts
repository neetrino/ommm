import { normalizeCouponCode } from './coupon-code.util';

describe('normalizeCouponCode', () => {
  it('accepts letters, digits, and a hyphen', () => {
    expect(normalizeCouponCode('neetrino-500')).toBe('NEETRINO-500');
    expect(normalizeCouponCode('HELEN20')).toBe('HELEN20');
  });

  it('rejects a hyphen at the edge or doubled', () => {
    expect(() => normalizeCouponCode('-HELEN')).toThrow('Invalid code');
    expect(() => normalizeCouponCode('HELEN-')).toThrow('Invalid code');
    expect(() => normalizeCouponCode('HELEN--20')).toThrow('Invalid code');
  });
});
