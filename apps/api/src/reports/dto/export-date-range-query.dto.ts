import { IsIn, IsOptional } from 'class-validator';
import {
  EXPORT_LOCALES,
  type ExportLocale,
} from '../../common/xlsx/export-locale';
import { DateRangeQueryDto } from './date-range-query.dto';

/** Date range plus the workbook language for Excel report exports. */
export class ExportDateRangeQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsIn(EXPORT_LOCALES)
  locale?: ExportLocale;
}
