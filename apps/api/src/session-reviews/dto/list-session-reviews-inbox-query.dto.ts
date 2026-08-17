import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

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
  @IsIn(SESSION_REVIEW_RATING_FILTERS)
  rating?: SessionReviewRatingFilter;

  @IsOptional()
  @IsIn(SESSION_REVIEW_VISIBILITY_FILTERS)
  visibility?: SessionReviewVisibilityFilter;
}
