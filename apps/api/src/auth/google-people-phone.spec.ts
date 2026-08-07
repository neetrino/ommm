import { pickNormalizedGooglePhone } from './google-people-phone';

describe('pickNormalizedGooglePhone', () => {
  it('returns null for empty lists', () => {
    expect(pickNormalizedGooglePhone(undefined)).toBeNull();
    expect(pickNormalizedGooglePhone([])).toBeNull();
  });

  it('prefers the primary valid number', () => {
    expect(
      pickNormalizedGooglePhone([
        { value: '+37441111111' },
        { value: '+37441881822', metadata: { primary: true } },
      ]),
    ).toBe('+37441881822');
  });

  it('skips invalid values and uses the first valid one', () => {
    expect(
      pickNormalizedGooglePhone([
        { value: 'short' },
        { value: '+374 41 881822' },
      ]),
    ).toBe('+37441881822');
  });
});
