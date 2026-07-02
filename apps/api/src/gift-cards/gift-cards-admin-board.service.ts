import { Injectable, Logger } from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { ListAdminGiftCardBatchesQueryDto } from './dto/list-admin-gift-card-batches-query.dto';
import {
  buildGiftCardBatchWhere,
  resolveGiftCardBatchOrderBy,
} from './gift-cards-list-query.builder';
import {
  type AdminBoardBatchRow,
  giftCardBatchDelegate,
  readBatchAmount,
  readGiftCardAmount,
  readGiftCardBalance,
  readGiftCardImage,
  serializeAdminBoardBatch,
} from './gift-cards.mapper';

@Injectable()
export class GiftCardsAdminBoardService {
  private readonly logger = new Logger(GiftCardsAdminBoardService.name);

  constructor(private readonly prisma: PrismaService) {}

  listAdminBoard(query: ListAdminGiftCardBatchesQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;

    if (!hasPagination) {
      return this.loadAdminBoardLegacy().then((batches) =>
        batches.map((batch) => serializeAdminBoardBatch(batch)),
      );
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    return this.loadAdminBoardPage(query, take, offset).then(
      ({ batches, total }) => ({
        items: batches.map((batch) => serializeAdminBoardBatch(batch)),
        total,
        take,
        offset,
      }),
    );
  }

  private async loadAdminBoardLegacy(): Promise<AdminBoardBatchRow[]> {
    const page = await this.loadAdminBoardPage({}, 500, 0);
    return page.batches;
  }

  private async loadAdminBoardPage(
    query: ListAdminGiftCardBatchesQueryDto,
    take: number,
    offset: number,
  ): Promise<{ batches: AdminBoardBatchRow[]; total: number }> {
    try {
      const batchDelegate = giftCardBatchDelegate(this.prisma);
      const where = buildGiftCardBatchWhere(query);
      const orderBy = resolveGiftCardBatchOrderBy(query) as {
        createdAt?: 'asc' | 'desc';
        amountAmd?: 'asc' | 'desc';
        expiresAt?: 'asc' | 'desc';
      };
      const [rows, total] = await Promise.all([
        batchDelegate.findMany({
          where,
          include: {
            purchaser: { select: { email: true, name: true } },
            recipient: { select: { email: true, name: true } },
          },
          orderBy,
          take,
          skip: offset,
        }),
        batchDelegate.count({ where }),
      ]);
      return {
        batches: rows as unknown as AdminBoardBatchRow[],
        total,
      };
    } catch (error) {
      if (
        !(error instanceof PrismaClientKnownRequestError) ||
        error.code !== 'P2021'
      ) {
        throw error;
      }
      this.logger.warn(
        'GiftCardBatch table is missing; falling back to grouped GiftCard board response.',
      );
      const sorted = this.filterGroupedAdminBoardFallback(
        await this.loadGroupedAdminBoardFallback(),
        query,
      );
      return {
        batches: sorted.slice(offset, offset + take),
        total: sorted.length,
      };
    }
  }

  private filterGroupedAdminBoardFallback(
    batches: AdminBoardBatchRow[],
    query: ListAdminGiftCardBatchesQueryDto,
  ): AdminBoardBatchRow[] {
    const now = Date.now();
    const search = query.search?.trim().toLowerCase() ?? '';
    let rows = batches;

    if (search.length > 0) {
      rows = rows.filter((batch) => {
        const haystack = [
          batch.purchaser.name,
          batch.purchaser.email,
          batch.recipient?.name,
          batch.recipient?.email,
          batch.recipientEmail,
          batch.recipientName,
          batch.message,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    if (query.status && query.status !== 'all') {
      rows = rows.filter((batch) => batch.status === query.status);
    }

    if (query.expiration === 'valid') {
      rows = rows.filter((batch) => {
        if (batch.status === GiftCardStatus.EXPIRED) {
          return false;
        }
        if (batch.expiresAt === null) {
          return true;
        }
        return new Date(batch.expiresAt).getTime() >= now;
      });
    } else if (query.expiration === 'expired') {
      rows = rows.filter((batch) => {
        if (batch.status === GiftCardStatus.EXPIRED) {
          return true;
        }
        if (batch.expiresAt === null) {
          return false;
        }
        return new Date(batch.expiresAt).getTime() < now;
      });
    }

    if (query.amountMin !== undefined) {
      rows = rows.filter((batch) => readBatchAmount(batch) >= query.amountMin!);
    }
    if (query.amountMax !== undefined) {
      rows = rows.filter((batch) => readBatchAmount(batch) <= query.amountMax!);
    }

    if (query.quick === 'active') {
      rows = rows.filter((batch) => batch.status === GiftCardStatus.ACTIVE);
    } else if (query.quick === 'expired') {
      rows = rows.filter((batch) => {
        if (batch.status === GiftCardStatus.EXPIRED) {
          return true;
        }
        if (batch.expiresAt === null) {
          return false;
        }
        return new Date(batch.expiresAt).getTime() < now;
      });
    } else if (query.quick === 'unredeemed') {
      rows = rows.filter(
        (batch) =>
          batch.status === GiftCardStatus.ACTIVE && batch.availableQuantity > 0,
      );
    }

    const order = query.order ?? 'newest';
    return [...rows].sort((a, b) => {
      if (order === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      if (order === 'amountHigh') {
        return readBatchAmount(b) - readBatchAmount(a);
      }
      if (order === 'amountLow') {
        return readBatchAmount(a) - readBatchAmount(b);
      }
      if (order === 'expirationSoon') {
        const aTime = a.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const bTime = b.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        return aTime - bTime;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private async loadGroupedAdminBoardFallback(): Promise<AdminBoardBatchRow[]> {
    const cards = await this.prisma.giftCard.findMany({
      include: {
        purchaser: { select: { email: true, name: true } },
        recipient: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const grouped = new Map<string, AdminBoardBatchRow>();

    for (const card of cards) {
      const key = [
        readGiftCardAmount(card),
        readGiftCardImage(card),
        card.status,
        card.purchaserId,
        card.recipientId ?? '',
        card.recipientEmail ?? '',
        card.recipientName ?? '',
        card.message ?? '',
        card.expiresAt?.toISOString() ?? '',
      ].join('|');
      const existing = grouped.get(key);
      const isAvailable =
        card.status === GiftCardStatus.ACTIVE && readGiftCardBalance(card) > 0
          ? 1
          : 0;
      if (!existing) {
        grouped.set(key, {
          id: card.id,
          amountAmd: readGiftCardAmount(card),
          imageUrl: readGiftCardImage(card),
          status: card.status,
          totalQuantity: 1,
          availableQuantity: isAvailable,
          recipientEmail: card.recipientEmail ?? null,
          recipientName: card.recipientName ?? null,
          message: card.message ?? null,
          expiresAt: card.expiresAt ?? null,
          createdAt: card.createdAt,
          purchaser: card.purchaser,
          recipient: card.recipient,
        });
        continue;
      }
      existing.totalQuantity += 1;
      existing.availableQuantity += isAvailable;
      if (card.createdAt > existing.createdAt) {
        existing.createdAt = card.createdAt;
      }
    }

    return [...grouped.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
