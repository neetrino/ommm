/** How long an account-closure code stays valid. */
export const ACCOUNT_DELETION_CODE_TTL_MINUTES = 10;

export const ACCOUNT_DELETION_CODE_TTL_MS =
  ACCOUNT_DELETION_CODE_TTL_MINUTES * 60 * 1000;

export const ACCOUNT_DELETION_CODE_LENGTH = 6;

/** Wrong guesses before the code is thrown away. */
export const ACCOUNT_DELETION_MAX_ATTEMPTS = 5;

export const ACCOUNT_DELETION_CODE_INVALID = 'Invalid or expired code';

export const COACH_SELF_DELETE_MESSAGE =
  'Coach accounts can only be removed by an administrator.';
