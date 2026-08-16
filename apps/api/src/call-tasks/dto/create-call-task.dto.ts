import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CallTaskDueOnMatches } from '../call-tasks.constants';

export class CreateCallTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  contactName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  phone!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  comment!: string;

  @IsString()
  @CallTaskDueOnMatches
  dueOn!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  userId?: string;
}
