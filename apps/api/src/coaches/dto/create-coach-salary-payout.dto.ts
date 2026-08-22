import { Matches } from 'class-validator';

export class CreateCoachSalaryPayoutDto {
  @Matches(/^\d{4}-\d{2}$/)
  month!: string;
}
