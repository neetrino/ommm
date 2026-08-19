import { Prisma } from '@prisma/client';
import { buildClientsTextSearchWhere } from './clients-list-search';

const insensitive = Prisma.QueryMode.insensitive;

function fieldContains(token: string) {
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

describe('buildClientsTextSearchWhere', () => {
  it('returns undefined for empty search', () => {
    expect(buildClientsTextSearchWhere(undefined)).toBeUndefined();
    expect(buildClientsTextSearchWhere('   ')).toBeUndefined();
  });

  it('matches a single token against any client field', () => {
    expect(buildClientsTextSearchWhere('Anna')).toEqual(fieldContains('Anna'));
  });

  it('requires every full-name token to match a field', () => {
    expect(buildClientsTextSearchWhere('Anna Lee')).toEqual({
      AND: [fieldContains('Anna'), fieldContains('Lee')],
    });
  });

  it('matches a partial last name together with the first name', () => {
    expect(buildClientsTextSearchWhere('Anna L')).toEqual({
      AND: [fieldContains('Anna'), fieldContains('L')],
    });
  });
});
