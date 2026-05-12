import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  classTypeId!: string;

  @IsString()
  coachId!: string;

  @IsOptional()
  @IsString()
  substituteCoachId?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  level?: string;

  @IsInt()
  @Min(0)
  priceCents!: number;
}
