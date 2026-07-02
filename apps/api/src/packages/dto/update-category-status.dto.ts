import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryStatusDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  categorySlug!: string;

  @IsBoolean()
  isActive!: boolean;
}
