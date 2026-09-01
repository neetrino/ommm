import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  ADMIN_PACKAGE_SESSION_ADJUST_MAX,
  ADMIN_PACKAGE_SESSION_ADJUST_MIN,
  ADMIN_PACKAGE_SESSION_REASON_MAX,
  ADMIN_PACKAGE_SESSION_REASON_MIN,
} from '../packages-admin-sessions.constants';

/** Admin adds complimentary package sessions (force majeure / goodwill). */
export class AdminAdjustUserPackageSessionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(ADMIN_PACKAGE_SESSION_ADJUST_MIN)
  @Max(ADMIN_PACKAGE_SESSION_ADJUST_MAX)
  sessions!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  userPackageBalanceId?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(ADMIN_PACKAGE_SESSION_REASON_MIN)
  @MaxLength(ADMIN_PACKAGE_SESSION_REASON_MAX)
  reason!: string;
}
