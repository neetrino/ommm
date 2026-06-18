import { IsOptional, IsString, MinLength } from 'class-validator';

export class ReconcilePackagesDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  userId?: string;
}
