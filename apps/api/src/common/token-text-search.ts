import { Prisma } from '@prisma/client';

export const TEXT_SEARCH_INSENSITIVE = Prisma.QueryMode.insensitive;

export function splitSearchTokens(rawQuery: string | undefined): string[] {
  return rawQuery?.trim().split(/\s+/).filter(Boolean) ?? [];
}

/** Every whitespace token must match. A lone token is returned as-is. */
export function buildTokenAndWhere<T>(
  rawQuery: string | undefined,
  matchToken: (token: string) => T,
): T | { AND: T[] } | undefined {
  const tokens = splitSearchTokens(rawQuery);
  const firstToken = tokens[0];
  if (firstToken === undefined) {
    return undefined;
  }
  if (tokens.length === 1) {
    return matchToken(firstToken);
  }
  return { AND: tokens.map((token) => matchToken(token)) };
}

export function containsInsensitive(token: string): {
  contains: string;
  mode: typeof TEXT_SEARCH_INSENSITIVE;
} {
  return { contains: token, mode: TEXT_SEARCH_INSENSITIVE };
}

/** First name, last name, email, phone, or user id. */
export function userContainsToken(token: string): Prisma.UserWhereInput {
  return {
    OR: [
      { id: containsInsensitive(token) },
      { email: containsInsensitive(token) },
      { name: containsInsensitive(token) },
      { lastName: containsInsensitive(token) },
      { phone: containsInsensitive(token) },
    ],
  };
}

export function personNameContainsToken(token: string): Prisma.UserWhereInput {
  return {
    OR: [
      { name: containsInsensitive(token) },
      { lastName: containsInsensitive(token) },
    ],
  };
}
