/** Env flag to disable the Arca pending-payment reconciliation cron (defaults on when Arca is configured). */
export const ARCA_RECONCILIATION_ENABLED_ENV = 'ARCA_RECONCILIATION_ENABLED';

/** Skip payments newer than this so the cron never races the live browser callback. */
export const ARCA_RECONCILE_MIN_AGE_MS = 2 * 60 * 1000;

/** Stop reconciling payments older than this (abandoned / expired bank orders). */
export const ARCA_RECONCILE_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

/** Max pending payments processed per reconciliation run to bound Arca API load. */
export const ARCA_RECONCILE_BATCH_SIZE = 50;
