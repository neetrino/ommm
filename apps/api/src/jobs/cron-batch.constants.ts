/** Env override for the single background-jobs batch (Render process env). */
export const CRON_BATCH_SCHEDULE_ENV = 'CRON_BATCH_SCHEDULE';

/** Default: :00 and :30 so Neon can idle ≥5 min between slots. */
export const DEFAULT_CRON_BATCH_SCHEDULE = '0,30 * * * *';

export function resolveCronBatchSchedule(
  raw: string | undefined = process.env[CRON_BATCH_SCHEDULE_ENV],
): string {
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_CRON_BATCH_SCHEDULE;
}
