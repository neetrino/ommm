import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { ACCOUNT_DELETION_CODE_LENGTH } from './account-deletion.constants';

const CODE_SPAN = 10 ** ACCOUNT_DELETION_CODE_LENGTH;
const CODE_PATTERN = new RegExp(`^\\d{${ACCOUNT_DELETION_CODE_LENGTH}}$`);

/** Six-digit code. The raw value is emailed once and never stored. */
export function newAccountDeletionCode(): string {
  return randomInt(0, CODE_SPAN)
    .toString()
    .padStart(ACCOUNT_DELETION_CODE_LENGTH, '0');
}

export function isAccountDeletionCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

export function hashAccountDeletionCode(
  secret: string,
  userId: string,
  code: string,
): string {
  return createHmac('sha256', secret).update(`${userId}:${code}`).digest('hex');
}

export function accountDeletionCodesMatch(
  storedHash: string,
  candidateHash: string,
): boolean {
  const stored = Buffer.from(storedHash, 'utf8');
  const candidate = Buffer.from(candidateHash, 'utf8');
  if (stored.length !== candidate.length) {
    return false;
  }
  return timingSafeEqual(stored, candidate);
}
