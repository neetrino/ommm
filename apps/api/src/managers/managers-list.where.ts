import { Prisma, Role } from '@prisma/client';
import {
  buildTokenAndWhere,
  userContainsToken,
} from '../common/token-text-search';
import { AdminManagerStatusFilter } from './managers-list.constants';

export type ManagersListWhereQuery = {
  q?: string;
  status?: AdminManagerStatusFilter[];
};

function statusClause(
  status: AdminManagerStatusFilter,
): Prisma.UserWhereInput | null {
  if (status === AdminManagerStatusFilter.ACTIVE) {
    return { isBlocked: false };
  }
  if (status === AdminManagerStatusFilter.BLOCKED) {
    return { isBlocked: true };
  }
  return null;
}

/** Prisma `where` for the admin manager directory. */
export function buildManagersListWhere(
  query: ManagersListWhereQuery,
): Prisma.UserWhereInput {
  const and: Prisma.UserWhereInput[] = [{ role: Role.MANAGER }];
  const searchWhere = buildTokenAndWhere(query.q, userContainsToken);
  if (searchWhere) {
    and.push(searchWhere);
  }

  const statusClauses = (query.status ?? [])
    .map((status) => statusClause(status))
    .filter((clause): clause is Prisma.UserWhereInput => clause !== null);

  if (statusClauses.length === 1) {
    and.push(statusClauses[0]);
  } else if (statusClauses.length > 1) {
    and.push({ OR: statusClauses });
  }

  return { AND: and };
}
