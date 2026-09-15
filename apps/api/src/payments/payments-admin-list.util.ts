import { Prisma } from '@prisma/client';
import { buildOpenEndedStudioDateTimeFilter } from '../common/studio-date-range';
import {
  buildTokenAndWhere,
  containsInsensitive,
  userContainsToken,
} from '../common/token-text-search';
import type { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import { buildSourceFilter } from './payments.helpers';

type BuildAdminListPaymentsWhereOptions = {
  /** When set, restricts to package payments for these UserPackage ids. */
  packageSourceWhere?: Prisma.PaymentWhereInput | null;
};

/** Builds the Prisma where clause for the admin payments ledger. */
export function buildAdminListPaymentsWhere(
  query: AdminListPaymentsQueryDto,
  options: BuildAdminListPaymentsWhereOptions = {},
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
    ...(query.status?.length
      ? {
          status:
            query.status.length === 1
              ? query.status[0]!
              : { in: query.status },
        }
      : {}),
    ...(query.paymentMethod?.length
      ? {
          paymentMethod:
            query.paymentMethod.length === 1
              ? query.paymentMethod[0]!
              : { in: query.paymentMethod },
        }
      : {}),
    ...(sourceFilter ?? {}),
    ...(options.packageSourceWhere ?? {}),
    ...(createdAt ? { createdAt } : {}),
    ...(searchWhere ?? {}),
  };
}
