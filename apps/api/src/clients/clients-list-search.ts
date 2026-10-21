import type { Prisma } from '@prisma/client';
import {
  buildTokenAndWhere,
  personNameContainsToken,
  userContainsToken,
} from '../common/token-text-search';

/**
 * Matches first + last name together or any token of the query.
 * A lone token still matches email, phone, WhatsApp phone, or id.
 */
export function buildClientsTextSearchWhere(
  rawQuery: string | undefined,
): Prisma.UserWhereInput | undefined {
  return buildTokenAndWhere(rawQuery, userContainsToken);
}

/** Coach directory: first and last name only, never phone or email. */
export function buildClientsNameSearchWhere(
  rawQuery: string | undefined,
): Prisma.UserWhereInput | undefined {
  return buildTokenAndWhere(rawQuery, personNameContainsToken);
}
