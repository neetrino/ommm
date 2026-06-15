import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  categoryName!: string;

  @IsBoolean()
  isActive!: boolean;
}
