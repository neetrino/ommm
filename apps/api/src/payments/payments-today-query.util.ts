import { utcToStudioCalendarDate } from '../common/studio-timezone';
import type { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';

/** Forces the list query to the current studio calendar day, ignoring caller-supplied dates. */
export function clampPaymentsQueryToToday(
  query: AdminListPaymentsQueryDto,
  now: Date = new Date(),
): AdminListPaymentsQueryDto {
  const today = utcToStudioCalendarDate(now);
  return { ...query, from: today, to: today };
}
