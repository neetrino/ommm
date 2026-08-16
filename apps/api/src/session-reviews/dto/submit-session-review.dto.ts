import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  SESSION_REVIEW_COMMENT_MAX,
  SESSION_REVIEW_RATING_MAX,
  SESSION_REVIEW_RATING_MIN,
} from '../session-reviews.constants';

export class SubmitSessionReviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(SESSION_REVIEW_RATING_MIN)
  @Max(SESSION_REVIEW_RATING_MAX)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(SESSION_REVIEW_COMMENT_MAX)
  comment?: string;

  @IsBoolean()
  isAnonymous!: boolean;
}
