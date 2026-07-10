import type { ArcaSyncOutcome } from './arca.types';

/** Browser return page after Arca callback — not the bank sync outcome itself. */
export type ArcaCallbackRedirect = 'success' | 'failed' | 'pending';

/**
 * Maps a bank sync outcome to the user-facing return page.
 * Only `deposited` and bank-confirmed `failed` are definitive; ambiguous outcomes
 * stay on a pending page so users are not told payment failed prematurely.
 */
export function mapArcaSyncOutcomeToRedirect(
  outcome: ArcaSyncOutcome,
): ArcaCallbackRedirect {
  if (outcome === 'deposited') {
    return 'success';
  }
  if (outcome === 'failed') {
    return 'failed';
  }
  return 'pending';
}
