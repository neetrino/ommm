import { ContentStatus, ContentType } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpsertPostDto {
  @IsEnum(ContentType)
  type!: ContentType;

  @IsEnum(ContentStatus)
  status!: ContentStatus;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  editorialNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  reviewedById?: string;

  @IsOptional()
  @IsDateString()
  reviewedAt?: string;

  @IsOptional()
  @IsDateString()
  submittedForReviewAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverImageUrl?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
