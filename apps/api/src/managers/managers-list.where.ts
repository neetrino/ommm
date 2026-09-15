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
  const searchWhere = buildTokenAndWhere(query.q, userContainsToken);
  const statusClauses = (query.status ?? [])
    .map((status) => statusClause(status))
    .filter((clause): clause is Prisma.UserWhereInput => clause !== null);

  return {
    role: Role.MANAGER,
    ...(searchWhere ?? {}),
    ...(statusClauses.length === 1
      ? statusClauses[0]
      : statusClauses.length > 1
        ? { OR: statusClauses }
        : {}),
  };
}
