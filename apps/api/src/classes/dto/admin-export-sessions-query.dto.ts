import { IsIn, IsOptional } from 'class-validator';
import { AdminListSessionsQueryDto } from './admin-list-sessions-query.dto';

const SCHEDULE_EXPORT_LOCALES = ['en', 'hy', 'ru'] as const;

export type ScheduleExportLocale = (typeof SCHEDULE_EXPORT_LOCALES)[number];

/** Same filters as the admin schedule list, plus workbook language. */
export class AdminExportSessionsQueryDto extends AdminListSessionsQueryDto {
  @IsOptional()
  @IsIn(SCHEDULE_EXPORT_LOCALES)
  locale?: ScheduleExportLocale;
}
