import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import {
  MAX_FREEZE_DAYS_PER_USE,
  MIN_FREEZE_DAYS_PER_REQUEST,
} from '../packages-freeze.constants';

export class FreezeUserPackageDto {
  @Type(() => Number)
  @IsInt()
  @Min(MIN_FREEZE_DAYS_PER_REQUEST)
  @Max(MAX_FREEZE_DAYS_PER_USE)
  days!: number;
}
