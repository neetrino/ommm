import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminConvertGiftCardDto {
  @IsIn(['TO_MONEY', 'TO_CLASSES'])
  direction!: 'TO_MONEY' | 'TO_CLASSES';

  @IsOptional()
  @IsString()
  @MaxLength(191)
  classTypeId?: string;
}
