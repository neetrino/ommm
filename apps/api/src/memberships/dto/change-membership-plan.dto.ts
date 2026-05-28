import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangeMembershipPlanDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  planId!: string;
}
