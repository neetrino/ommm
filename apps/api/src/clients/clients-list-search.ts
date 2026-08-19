import { Prisma } from '@prisma/client';

const insensitive = Prisma.QueryMode.insensitive;

function tokenMatchesAnyClientField(token: string): Prisma.UserWhereInput {
  return {
    OR: [
      { id: { contains: token, mode: insensitive } },
      { email: { contains: token, mode: insensitive } },
      { name: { contains: token, mode: insensitive } },
      { lastName: { contains: token, mode: insensitive } },
      { phone: { contains: token, mode: insensitive } },
    ],
  };
}

/**
 * Matches first + last name together or any token of the query.
 * A lone token still matches email, phone, or id.
 */
export function buildClientsTextSearchWhere(
  rawQuery: string | undefined,
): Prisma.UserWhereInput | undefined {
  const tokens = rawQuery?.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstToken = tokens[0];
  if (firstToken === undefined) {
    return undefined;
  }
  if (tokens.length === 1) {
    return tokenMatchesAnyClientField(firstToken);
  }
  return {
    AND: tokens.map((token) => tokenMatchesAnyClientField(token)),
  };
}
