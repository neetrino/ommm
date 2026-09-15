import { GiftCardStatus, Prisma } from '@prisma/client';
import {
  buildTokenAndWhere,
  containsInsensitive,
} from '../common/token-text-search';
import type { ListAdminGiftCardBatchesQueryDto } from './dto/list-admin-gift-card-batches-query.dto';

function giftCardExpirationClause(
  expiration: NonNullable<
    ListAdminGiftCardBatchesQueryDto['expiration']
  >[number],
  now: Date,
): Prisma.GiftCardBatchWhereInput {
  if (expiration === 'valid') {
    return {
      status: { not: GiftCardStatus.EXPIRED },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };
  }
  return {
    OR: [{ status: GiftCardStatus.EXPIRED }, { expiresAt: { lt: now } }],
  };
}

function giftCardQuickClause(
  quick: NonNullable<ListAdminGiftCardBatchesQueryDto['quick']>[number],
  now: Date,
): Prisma.GiftCardBatchWhereInput {
  if (quick === 'active') {
    return { status: GiftCardStatus.ACTIVE };
  }
  if (quick === 'expired') {
    return {
      OR: [{ status: GiftCardStatus.EXPIRED }, { expiresAt: { lt: now } }],
    };
  }
  return {
    status: GiftCardStatus.ACTIVE,
    availableQuantity: { gt: 0 },
  };
}

export function buildGiftCardBatchWhere(
  query: ListAdminGiftCardBatchesQueryDto,
): Prisma.GiftCardBatchWhereInput {
  const and: Prisma.GiftCardBatchWhereInput[] = [];
  const now = new Date();

  const searchWhere = buildTokenAndWhere(
    query.search,
    (token): Prisma.GiftCardBatchWhereInput => ({
      OR: [
        {
          purchaser: {
            OR: [
              { name: containsInsensitive(token) },
              { lastName: containsInsensitive(token) },
              { email: containsInsensitive(token) },
            ],
          },
        },
        {
          recipient: {
            OR: [
              { name: containsInsensitive(token) },
              { lastName: containsInsensitive(token) },
              { email: containsInsensitive(token) },
            ],
          },
        },
        { recipientEmail: containsInsensitive(token) },
        { recipientName: containsInsensitive(token) },
        { message: containsInsensitive(token) },
      ],
    }),
  );
  if (searchWhere) {
    and.push(searchWhere);
  }

  if (query.status?.length) {
    and.push({
      status:
        query.status.length === 1 ? query.status[0] : { in: query.status },
    });
  }

  if (query.expiration?.length) {
    const clauses = query.expiration.map((expiration) =>
      giftCardExpirationClause(expiration, now),
    );
    if (clauses.length === 1) {
      and.push(clauses[0]);
    } else {
      and.push({ OR: clauses });
    }
  }

  if (query.amountMin !== undefined) {
    and.push({ amountAmd: { gte: query.amountMin } });
  }
  if (query.amountMax !== undefined) {
    and.push({ amountAmd: { lte: query.amountMax } });
  }

  if (query.quick?.length) {
    const clauses = query.quick.map((quick) => giftCardQuickClause(quick, now));
    if (clauses.length === 1) {
      and.push(clauses[0]);
    } else {
      and.push({ OR: clauses });
    }
  }

  return and.length > 0 ? { AND: and } : {};
}

export function resolveGiftCardBatchOrderBy(
  query: ListAdminGiftCardBatchesQueryDto,
): Prisma.GiftCardBatchOrderByWithRelationInput {
  switch (query.order) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'amountHigh':
      return { amountAmd: 'desc' };
    case 'amountLow':
      return { amountAmd: 'asc' };
    case 'expirationSoon':
      return { expiresAt: 'asc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}
