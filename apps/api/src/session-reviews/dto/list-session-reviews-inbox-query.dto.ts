import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import {
  parseCsvEnumQueryParam,
  parseCsvQueryParam,
} from '../../common/parse-csv-query-param';

export const SESSION_REVIEW_RATING_FILTERS = ['1', '2', '3', '4', '5'] as const;
export type SessionReviewRatingFilter =
  (typeof SESSION_REVIEW_RATING_FILTERS)[number];

export const SESSION_REVIEW_VISIBILITY_FILTERS = [
  'named',
  'anonymous',
] as const;
export type SessionReviewVisibilityFilter =
  (typeof SESSION_REVIEW_VISIBILITY_FILTERS)[number];

export class ListSessionReviewsInboxQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, SESSION_REVIEW_RATING_FILTERS),
  )
  @IsArray()
  @IsIn([...SESSION_REVIEW_RATING_FILTERS], { each: true })
  rating?: SessionReviewRatingFilter[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, SESSION_REVIEW_VISIBILITY_FILTERS),
  )
  @IsArray()
  @IsIn([...SESSION_REVIEW_VISIBILITY_FILTERS], { each: true })
  visibility?: SessionReviewVisibilityFilter[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  coachId?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  packagePlanId?: string[];
}
