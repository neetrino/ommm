/** Matches web `ACCOUNT_SESSION_RANGE_DAYS` for coach panel session/roster loads. */
export const COACH_SESSION_RANGE_DAYS = 14;

/** Matches web `MAX_BIO_LENGTH` for coach profile bio. */
export const COACH_BIO_MAX_LENGTH = 4000;

export const COACH_ANALYTICS_PERIOD_DAYS = {
  month: 30,
  year: 365,
} as const;

export type CoachAnalyticsPeriod = keyof typeof COACH_ANALYTICS_PERIOD_DAYS;
