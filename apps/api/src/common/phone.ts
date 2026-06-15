import { BadRequestException } from '@nestjs/common';

export const ARMENIA_COUNTRY_CODE = '+374';
export const ARMENIA_NATIONAL_DIGIT_COUNT = 8;

const INTERNATIONAL_MIN_DIGITS = 8;
const INTERNATIONAL_MAX_DIGITS = 15;

/** Extracts digits from a phone string. */
export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Parses Armenian national digits (max 8) from common input variants. */
export function parseArmenianNationalDigits(value: string): string {
  let digits = extractPhoneDigits(value);
  if (digits.startsWith('374')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, ARMENIA_NATIONAL_DIGIT_COUNT);
}

/** Whether the value should be treated as an Armenian phone number. */
export function isArmenianPhoneCandidate(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }

  const compact = trimmed.replace(/\s+/g, '');
  if (compact.startsWith('+374') || compact.startsWith('374')) {
    return true;
  }

  const digits = extractPhoneDigits(trimmed);
  if (digits.startsWith('374')) {
    return true;
  }
  if (
    digits.startsWith('0') &&
    digits.length <= ARMENIA_NATIONAL_DIGIT_COUNT + 1
  ) {
    return true;
  }
  if (trimmed.startsWith('+') && !compact.startsWith('+374')) {
    return false;
  }
  return digits.length <= ARMENIA_NATIONAL_DIGIT_COUNT;
}

/** Formats a phone number for display. Armenian numbers use +374 XX XXXXXX. */
export function formatPhoneForDisplay(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '';
  }
  if (isArmenianPhoneCandidate(trimmed)) {
    const national = parseArmenianNationalDigits(trimmed);
    if (national.length > 0) {
      if (national.length <= 2) {
        return `${ARMENIA_COUNTRY_CODE} ${national}`;
      }
      return `${ARMENIA_COUNTRY_CODE} ${national.slice(0, 2)} ${national.slice(2)}`;
    }
  }
  return trimmed.replace(/\s+/g, ' ');
}

/** Validates phone numbers. Armenian numbers require exactly 8 national digits. */
export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (isArmenianPhoneCandidate(trimmed)) {
    let digits = extractPhoneDigits(trimmed);
    if (digits.startsWith('374')) {
      digits = digits.slice(3);
    } else if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits.length === ARMENIA_NATIONAL_DIGIT_COUNT;
  }
  const digits = extractPhoneDigits(trimmed);
  return (
    digits.length >= INTERNATIONAL_MIN_DIGITS &&
    digits.length <= INTERNATIONAL_MAX_DIGITS
  );
}

/**
 * Normalizes a phone number for storage.
 * Armenian numbers are stored E.164-like: +37441881822.
 */
export function normalizePhoneForStorage(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '';
  }
  if (isArmenianPhoneCandidate(trimmed)) {
    const national = parseArmenianNationalDigits(trimmed);
    if (national.length > 0) {
      return `${ARMENIA_COUNTRY_CODE}${national}`;
    }
  }
  return trimmed.replace(/\s+/g, '');
}

/** Validates and normalizes a required phone number for persistence. */
export function normalizeRequiredPhone(value: string): string {
  const normalized = normalizePhoneForStorage(value);
  if (!isValidPhoneNumber(value)) {
    throw new BadRequestException('Invalid phone number');
  }
  return normalized;
}

/** Validates and normalizes an optional phone number for persistence. */
export function normalizeOptionalPhone(value: string | null): string | null {
  const trimmed = (value ?? '').trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (!isValidPhoneNumber(trimmed)) {
    throw new BadRequestException('Invalid phone number');
  }
  return normalizePhoneForStorage(trimmed);
}

/** Validates and normalizes optional studio/public contact phone (may stay formatted loosely). */
export function normalizeOptionalContactPhone(
  value: string | null | undefined,
): string | null {
  const trimmed = (value ?? '').trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (!isValidPhoneNumber(trimmed)) {
    throw new BadRequestException('Invalid phone number');
  }
  return normalizePhoneForStorage(trimmed);
}
