import {
  formatPhoneForDisplay,
  isArmenianPhoneCandidate,
  isValidPhoneNumber,
  normalizeOptionalContactPhone,
  normalizeOptionalPhone,
  normalizePhoneForStorage,
  normalizeRequiredPhone,
  parseArmenianNationalDigits,
} from './phone';

describe('phone utilities', () => {
  describe('formatPhoneForDisplay', () => {
    it('formats compact Armenian numbers', () => {
      expect(formatPhoneForDisplay('+37441881822')).toBe('+374 41 881822');
      expect(formatPhoneForDisplay('37441881822')).toBe('+374 41 881822');
    });

    it('formats local Armenian variants', () => {
      expect(formatPhoneForDisplay('041881822')).toBe('+374 41 881822');
      expect(formatPhoneForDisplay('41881822')).toBe('+374 41 881822');
    });

    it('keeps already formatted values', () => {
      expect(formatPhoneForDisplay('+374 41 881822')).toBe('+374 41 881822');
    });

    it('handles empty values safely', () => {
      expect(formatPhoneForDisplay(null)).toBe('');
      expect(formatPhoneForDisplay(undefined)).toBe('');
      expect(formatPhoneForDisplay('   ')).toBe('');
    });
  });

  describe('normalizePhoneForStorage', () => {
    it('stores Armenian numbers in E.164-like form', () => {
      expect(normalizePhoneForStorage('+374 41 881822')).toBe('+37441881822');
      expect(normalizePhoneForStorage('041881822')).toBe('+37441881822');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('accepts valid Armenian numbers', () => {
      expect(isValidPhoneNumber('+37441881822')).toBe(true);
      expect(isValidPhoneNumber('+374 41 881822')).toBe(true);
      expect(isValidPhoneNumber('041881822')).toBe(true);
    });

    it('rejects invalid Armenian numbers', () => {
      expect(isValidPhoneNumber('+3744188182')).toBe(false);
      expect(isValidPhoneNumber('+374418818221')).toBe(false);
      expect(isValidPhoneNumber('abc')).toBe(false);
    });
  });

  describe('normalizeRequiredPhone', () => {
    it('normalizes valid numbers', () => {
      expect(normalizeRequiredPhone('+374 41 881822')).toBe('+37441881822');
    });

    it('throws for invalid numbers', () => {
      expect(() => normalizeRequiredPhone('123')).toThrow(
        'Invalid phone number',
      );
    });
  });

  describe('parseArmenianNationalDigits', () => {
    it('caps national digits at eight', () => {
      expect(parseArmenianNationalDigits('+374418818221')).toBe('41881822');
    });
  });

  describe('isArmenianPhoneCandidate', () => {
    it('detects Armenian candidates', () => {
      expect(isArmenianPhoneCandidate('+37441881822')).toBe(true);
      expect(isArmenianPhoneCandidate('41881822')).toBe(true);
    });
  });

  describe('normalizeOptionalPhone', () => {
    it('returns null for empty input', () => {
      expect(normalizeOptionalPhone(null)).toBeNull();
      expect(normalizeOptionalPhone('')).toBeNull();
    });
  });

  describe('normalizeOptionalContactPhone', () => {
    it('normalizes studio contact phone', () => {
      expect(normalizeOptionalContactPhone('+374 10 123456')).toBe(
        '+37410123456',
      );
    });
  });
});
