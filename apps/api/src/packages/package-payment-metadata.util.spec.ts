import {
  readBookSessionIdFromMetadata,
  readPackagePlanIdFromMetadata,
  withBookSessionIdMetadata,
  withPackagePlanIdMetadata,
} from './package-payment-metadata.util';

describe('package-payment-metadata.util', () => {
  it('writes and reads planId without dropping extra fields', () => {
    const metadata = withPackagePlanIdMetadata(
      { provider: 'arca' },
      'plan-42',
      { statusReason: 'checkout_not_started' },
    );
    expect(readPackagePlanIdFromMetadata(metadata)).toBe('plan-42');
    const record = metadata as Record<string, unknown>;
    expect(record.provider).toBe('arca');
    expect(record.statusReason).toBe('checkout_not_started');
  });

  it('returns null for missing or invalid metadata', () => {
    expect(readPackagePlanIdFromMetadata(null)).toBeNull();
    expect(readPackagePlanIdFromMetadata({})).toBeNull();
    expect(readPackagePlanIdFromMetadata({ planId: 1 })).toBeNull();
  });

  it('keeps planId when storing the class to book', () => {
    const metadata = withBookSessionIdMetadata(
      { planId: 'plan-42', provider: 'arca' },
      'session-1',
    );
    expect(readBookSessionIdFromMetadata(metadata)).toBe('session-1');
    expect(readPackagePlanIdFromMetadata(metadata)).toBe('plan-42');
    expect(readBookSessionIdFromMetadata(null)).toBeNull();
  });
});
