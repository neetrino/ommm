import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateStudioDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  studioName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  whatsappUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  mapEmbedUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  workingHours?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  socialLinksJson?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cancellationHoursNotice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  waitlistOfferMinutes?: number;
}
