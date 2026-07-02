import { IsString, MaxLength, MinLength } from 'class-validator';

export class DeleteCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  categorySlug!: string;
}
