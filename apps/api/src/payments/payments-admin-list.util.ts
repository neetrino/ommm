import { Prisma } from '@prisma/client';
import { buildOpenEndedStudioDateTimeFilter } from '../common/studio-date-range';
import {
  buildTokenAndWhere,
  containsInsensitive,
  userContainsToken,
} from '../common/token-text-search';
import type { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import { buildSourceFilter } from './payments.helpers';

/** Builds the Prisma where clause for the admin payments ledger. */
export function buildAdminListPaymentsWhere(
  query: AdminListPaymentsQueryDto,
): Prisma.PaymentWhereInput {
  const sourceFilter = buildSourceFilter(query.source);
  const createdAt = buildOpenEndedStudioDateTimeFilter(query.from, query.to);
  const searchWhere = buildTokenAndWhere(
    query.q,
    (token): Prisma.PaymentWhereInput => ({
      OR: [
        { id: containsInsensitive(token) },
        { description: containsInsensitive(token) },
        { paymentReference: containsInsensitive(token) },
        { user: userContainsToken(token) },
      ],
    }),
  );

  return {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
    ...(sourceFilter ?? {}),
    ...(createdAt ? { createdAt } : {}),
    ...(searchWhere ?? {}),
  };
}
