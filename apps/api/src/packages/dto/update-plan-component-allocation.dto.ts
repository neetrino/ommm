import { IsInt, IsString, Max, Min } from 'class-validator';

const MAX_PACKAGE_SESSIONS = 999;

export class UpdatePlanComponentAllocationDto {
  @IsString()
  componentId!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_PACKAGE_SESSIONS)
  sessionCount!: number;
}
