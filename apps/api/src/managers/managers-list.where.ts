import { Prisma, Role } from '@prisma/client';
import {
  buildTokenAndWhere,
  userContainsToken,
} from '../common/token-text-search';
import { AdminManagerStatusFilter } from './managers-list.constants';

export type ManagersListWhereQuery = {
  q?: string;
  status?: AdminManagerStatusFilter;
};

/** Prisma `where` for the admin manager directory. */
export function buildManagersListWhere(
  query: ManagersListWhereQuery,
): Prisma.UserWhereInput {
  const searchWhere = buildTokenAndWhere(query.q, userContainsToken);
  return {
    role: Role.MANAGER,
    ...(searchWhere ?? {}),
    ...(query.status === AdminManagerStatusFilter.ACTIVE
      ? { isBlocked: false }
      : {}),
    ...(query.status === AdminManagerStatusFilter.BLOCKED
      ? { isBlocked: true }
      : {}),
  };
}
