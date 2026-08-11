import {
  isLatinPersonName,
  LATIN_PERSON_NAME_PATTERN,
} from './latin-person-name';

describe('latin person name', () => {
  it('accepts simple Latin names', () => {
    expect(isLatinPersonName('Anna')).toBe(true);
    expect(isLatinPersonName('John')).toBe(true);
  });

  it('accepts spaces, hyphens, and apostrophes', () => {
    expect(isLatinPersonName('Mary Jane')).toBe(true);
    expect(isLatinPersonName('Jean-Luc')).toBe(true);
    expect(isLatinPersonName("O'Brien")).toBe(true);
  });

  it('rejects Armenian and Cyrillic', () => {
    expect(isLatinPersonName('Աննա')).toBe(false);
    expect(isLatinPersonName('Анна')).toBe(false);
    expect(isLatinPersonName('Anna Աննա')).toBe(false);
  });

  it('rejects empty, digits, and punctuation-only', () => {
    expect(isLatinPersonName('')).toBe(false);
    expect(isLatinPersonName('   ')).toBe(false);
    expect(isLatinPersonName('Anna2')).toBe(false);
    expect(isLatinPersonName('--')).toBe(false);
  });

  it('exports a pattern matching the helper', () => {
    expect(LATIN_PERSON_NAME_PATTERN.test('Sofia')).toBe(true);
    expect(LATIN_PERSON_NAME_PATTERN.test('Գուրգեն')).toBe(false);
  });
});
