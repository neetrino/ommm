import { IsIn, IsString, MaxLength } from 'class-validator';

export class UploadCoachPhotoJsonDto {
  @IsString()
  @MaxLength(8_000_000)
  imageBase64!: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  mimeType!: string;
}
