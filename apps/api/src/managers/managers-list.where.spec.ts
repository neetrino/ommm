import { Role } from '@prisma/client';
import { buildManagersListWhere } from './managers-list.where';
import { AdminManagerStatusFilter } from './managers-list.constants';

describe('buildManagersListWhere', () => {
  it('scopes the directory to MANAGER role', () => {
    expect(buildManagersListWhere({})).toEqual({
      AND: [{ role: Role.MANAGER }],
    });
  });

  it('filters blocked accounts', () => {
    expect(
      buildManagersListWhere({ status: [AdminManagerStatusFilter.BLOCKED] }),
    ).toEqual({
      AND: [{ role: Role.MANAGER }, { isBlocked: true }],
    });
  });

  it('filters active accounts', () => {
    expect(
      buildManagersListWhere({ status: [AdminManagerStatusFilter.ACTIVE] }),
    ).toEqual({
      AND: [{ role: Role.MANAGER }, { isBlocked: false }],
    });
  });

  it('ORs multiple status filters', () => {
    expect(
      buildManagersListWhere({
        status: [
          AdminManagerStatusFilter.ACTIVE,
          AdminManagerStatusFilter.BLOCKED,
        ],
      }),
    ).toEqual({
      AND: [
        { role: Role.MANAGER },
        { OR: [{ isBlocked: false }, { isBlocked: true }] },
      ],
    });
  });

  it('matches every search token against user identity fields', () => {
    const where = buildManagersListWhere({ q: 'Gor Mkrtchyan' });
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { role: Role.MANAGER },
        expect.objectContaining({ AND: expect.any(Array) }),
      ]),
    );
    const clauses = where.AND;
    expect(Array.isArray(clauses)).toBe(true);
    if (!Array.isArray(clauses)) {
      return;
    }
    const searchAnd = clauses.find(
      (clause) =>
        clause !== null &&
        typeof clause === 'object' &&
        'AND' in clause &&
        Array.isArray(clause.AND),
    );
    expect(searchAnd).toBeDefined();
    if (
      searchAnd &&
      typeof searchAnd === 'object' &&
      'AND' in searchAnd &&
      Array.isArray(searchAnd.AND)
    ) {
      expect(searchAnd.AND).toHaveLength(2);
    }
  });
});
