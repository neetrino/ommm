import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  categoryName!: string;
}
