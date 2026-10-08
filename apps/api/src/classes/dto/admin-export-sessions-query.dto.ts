import { IsIn, IsOptional, Matches } from 'class-validator';
import { AdminListSessionsQueryDto } from './admin-list-sessions-query.dto';

const SCHEDULE_EXPORT_LOCALES = ['en', 'hy', 'ru'] as const;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export type ScheduleExportLocale = (typeof SCHEDULE_EXPORT_LOCALES)[number];

/**
 * Schedule workbook query.
 * `from` and `to` are redeclared so validation keeps them on this subclass.
 */
export class AdminExportSessionsQueryDto extends AdminListSessionsQueryDto {
  @IsOptional()
  @Matches(ISO_DAY)
  override from: string | undefined = undefined;

  @IsOptional()
  @Matches(ISO_DAY)
  override to: string | undefined = undefined;

  @IsOptional()
  @IsIn(SCHEDULE_EXPORT_LOCALES)
  locale?: ScheduleExportLocale;
}
