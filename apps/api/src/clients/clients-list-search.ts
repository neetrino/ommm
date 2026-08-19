import type { Prisma } from '@prisma/client';
import {
  buildTokenAndWhere,
  userContainsToken,
} from '../common/token-text-search';

/**
 * Matches first + last name together or any token of the query.
 * A lone token still matches email, phone, or id.
 */
export function buildClientsTextSearchWhere(
  rawQuery: string | undefined,
): Prisma.UserWhereInput | undefined {
  return buildTokenAndWhere(rawQuery, userContainsToken);
}
