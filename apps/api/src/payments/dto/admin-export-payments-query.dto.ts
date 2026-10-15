import { IsIn, IsOptional } from 'class-validator';
import {
  EXPORT_LOCALES,
  type ExportLocale,
} from '../../common/xlsx/export-locale';
import { AdminListPaymentsQueryDto } from './admin-list-payments-query.dto';

/** Admin payments ledger filters plus the workbook language; paging is ignored. */
export class AdminExportPaymentsQueryDto extends AdminListPaymentsQueryDto {
  @IsOptional()
  @IsIn(EXPORT_LOCALES)
  locale?: ExportLocale;
}
