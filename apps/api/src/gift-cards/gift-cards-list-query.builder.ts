import { GiftCardStatus, Prisma } from '@prisma/client';
import type { ListAdminGiftCardBatchesQueryDto } from './dto/list-admin-gift-card-batches-query.dto';

export function buildGiftCardBatchWhere(
  query: ListAdminGiftCardBatchesQueryDto,
): Prisma.GiftCardBatchWhereInput {
  const and: Prisma.GiftCardBatchWhereInput[] = [];
  const now = new Date();

  const search = query.search?.trim();
  if (search) {
    and.push({
      OR: [
        {
          purchaser: {
            OR: [
              {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            ],
          },
        },
        {
          recipient: {
            OR: [
              {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            ],
          },
        },
        {
          recipientEmail: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          recipientName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        { message: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    });
  }

  if (query.status && query.status !== 'all') {
    and.push({ status: query.status as GiftCardStatus });
  }

  if (query.expiration === 'valid') {
    and.push({
      status: { not: GiftCardStatus.EXPIRED },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    });
  } else if (query.expiration === 'expired') {
    and.push({
      OR: [{ status: GiftCardStatus.EXPIRED }, { expiresAt: { lt: now } }],
    });
  }

  if (query.amountMin !== undefined) {
    and.push({ amountAmd: { gte: query.amountMin } });
  }
  if (query.amountMax !== undefined) {
    and.push({ amountAmd: { lte: query.amountMax } });
  }

  if (query.quick === 'active') {
    and.push({ status: GiftCardStatus.ACTIVE });
  } else if (query.quick === 'expired') {
    and.push({
      OR: [{ status: GiftCardStatus.EXPIRED }, { expiresAt: { lt: now } }],
    });
  } else if (query.quick === 'unredeemed') {
    and.push({
      status: GiftCardStatus.ACTIVE,
      availableQuantity: { gt: 0 },
    });
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
