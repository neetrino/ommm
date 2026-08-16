import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CallTaskDueOnMatches } from '../call-tasks.constants';

export class UpdateCallTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  comment?: string;

  @IsOptional()
  @IsString()
  @CallTaskDueOnMatches
  dueOn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  userId?: string | null;
}
