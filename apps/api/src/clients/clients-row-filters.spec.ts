import { UserPackageStatus } from '@prisma/client';
import { matchesClientFilters } from './clients-row-filters';
import {
  AdminClientPackageFilter,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import type { ClientRow } from './clients-row.mapper';

function row(
  overrides: Pick<ClientRow, 'activePackageStatus' | 'hasPackageHistory'>,
): ClientRow {
  return overrides as ClientRow;
}

function query(
  packageFilter: AdminClientPackageFilter,
): AdminListClientsQueryDto {
  return { package: [packageFilter] };
}

describe('matchesClientFilters package history', () => {
  const signUpOnly = row({
    activePackageStatus: null,
    hasPackageHistory: false,
  });
  const expiredBuyer = row({
    activePackageStatus: UserPackageStatus.EXPIRED,
    hasPackageHistory: true,
  });

  it('keeps sign-ups with zero package history on never', () => {
    expect(
      matchesClientFilters(signUpOnly, query(AdminClientPackageFilter.NEVER)),
    ).toBe(true);
    expect(
      matchesClientFilters(
        expiredBuyer,
        query(AdminClientPackageFilter.NEVER),
      ),
    ).toBe(false);
  });

  it('keeps past buyers on inactive and excludes them from active', () => {
    expect(
      matchesClientFilters(
        expiredBuyer,
        query(AdminClientPackageFilter.INACTIVE),
      ),
    ).toBe(true);
    expect(
      matchesClientFilters(expiredBuyer, query(AdminClientPackageFilter.ACTIVE)),
    ).toBe(false);
  });
});
