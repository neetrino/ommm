const DEFAULT_CANCELLATION_HOURS_NOTICE = 24;

function parseHoursValue(raw: string | undefined): number | null {
  const cleaned = raw?.trim().replace(/^["']|["']$/g, '');
  if (cleaned === undefined || cleaned === '') {
    return null;
  }
  const parsed = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

/**
 * Studio policy hours, overridable via `CANCELLATION_HOURS_NOTICE` for local testing.
 * Remove the env var to fall back to studio settings (default 24h).
 */
export function resolveCancellationHoursNotice(
  studioValue: number | null | undefined,
  envValue?: string,
): number {
  const envOverride = parseHoursValue(envValue);
  if (envOverride !== null) {
    return envOverride;
  }
  return studioValue ?? DEFAULT_CANCELLATION_HOURS_NOTICE;
}

/** When 0, member cancel is allowed until class start (no advance notice). */
export function isCancellationNoticeEnforced(noticeHours: number): boolean {
  return noticeHours > 0;
}