import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { MAX_SESSION_ELIGIBILITY_IDS } from '../resolve-session-booking-eligibility';

export class ListSessionEligibilityQueryDto {
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
    }
    if (Array.isArray(value)) {
      return value.map(String);
    }
    return value;
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_SESSION_ELIGIBILITY_IDS)
  @IsString({ each: true })
  ids!: string[];
}
