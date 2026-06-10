const DEFAULT_CANCELLATION_HOURS_NOTICE = 24;

/**
 * Optional code override for cancel notice (hours). Not read from environment variables.
 * `0` = member cancel allowed until class start. `null` = use admin studio settings.
 */
export const CANCELLATION_HOURS_NOTICE_OVERRIDE: number | null = 0;

/**
 * Resolves how many hours before class start cancellation remains allowed.
 */
export function resolveCancellationHoursNotice(
  studioValue: number | null | undefined,
): number {
  if (CANCELLATION_HOURS_NOTICE_OVERRIDE !== null) {
    return CANCELLATION_HOURS_NOTICE_OVERRIDE;
  }
  return studioValue ?? DEFAULT_CANCELLATION_HOURS_NOTICE;
}

/** When 0, member cancel is allowed until class start (no advance notice). */
export function isCancellationNoticeEnforced(noticeHours: number): boolean {
  return noticeHours > 0;
}
