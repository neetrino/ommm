import { Role } from '@prisma/client';
import { buildManagersListWhere } from './managers-list.where';
import { AdminManagerStatusFilter } from './managers-list.constants';

describe('buildManagersListWhere', () => {
  it('scopes the directory to MANAGER role', () => {
    expect(buildManagersListWhere({})).toEqual({ role: Role.MANAGER });
  });

  it('filters blocked accounts', () => {
    expect(
      buildManagersListWhere({ status: AdminManagerStatusFilter.BLOCKED }),
    ).toEqual({
      role: Role.MANAGER,
      isBlocked: true,
    });
  });

  it('filters active accounts', () => {
    expect(
      buildManagersListWhere({ status: AdminManagerStatusFilter.ACTIVE }),
    ).toEqual({
      role: Role.MANAGER,
      isBlocked: false,
    });
  });

  it('matches every search token against user identity fields', () => {
    const where = buildManagersListWhere({ q: 'Gor Mkrtchyan' });
    const clauses = where.AND;
    expect(Array.isArray(clauses)).toBe(true);
    if (!Array.isArray(clauses)) {
      return;
    }
    expect(clauses).toHaveLength(2);
  });
});
