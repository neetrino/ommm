import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  readPackagePlanIdFromMetadata,
  withPackagePlanIdMetadata,
} from './package-payment-metadata.util';

describe('package-payment-metadata.util', () => {
  it('writes and reads planId without dropping extra fields', () => {
    const metadata = withPackagePlanIdMetadata(
      { provider: 'arca' },
      'plan-42',
      { statusReason: 'checkout_not_started' },
    );
    assert.equal(readPackagePlanIdFromMetadata(metadata), 'plan-42');
    const record = metadata as Record<string, unknown>;
    assert.equal(record.provider, 'arca');
    assert.equal(record.statusReason, 'checkout_not_started');
  });

  it('returns null for missing or invalid metadata', () => {
    assert.equal(readPackagePlanIdFromMetadata(null), null);
    assert.equal(readPackagePlanIdFromMetadata({}), null);
    assert.equal(readPackagePlanIdFromMetadata({ planId: 1 }), null);
  });
});
