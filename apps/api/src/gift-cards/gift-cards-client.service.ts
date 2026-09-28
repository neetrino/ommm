import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { ListMyGiftCardsQueryDto } from './dto/list-my-gift-cards-query.dto';
import {
  giftCardBatchDelegate,
  readBatchAmount,
  readGiftCardAmount,
  readGiftCardBalance,
  serializeUserGiftCard,
} from './gift-cards.mapper';
import { expireDueGiftCards } from './gift-card-ledger';
import { resolveGiftCardPolicy } from './gift-card-policy';
import { redeemGiftCardForUser } from './gift-card-redeem';
import { GiftCardRedeemGuardService } from './gift-card-redeem-guard.service';
import { peekSpendableGiftCreditsCents } from '../packages/package-gift-credits.util';

const GIFT_ACTIVITY_PAGE = 40;

const GIFT_RECIPIENT_SEARCH_MIN_CHARS = 1;
const GIFT_RECIPIENT_SEARCH_LIMIT = 20;

@Injectable()
export class GiftCardsClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redeemGuard: GiftCardRedeemGuardService,
  ) {}

  listMine(userId: string, query: ListMyGiftCardsQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const where = { purchaserId: userId };
    const include = { batch: { select: { imageUrl: true } } };
    const orderBy = { createdAt: 'desc' as const };

    if (!hasPagination) {
      return this.prisma.giftCard
        .findMany({ where, include, orderBy })
        .then((cards) => cards.map((card) => serializeUserGiftCard(card)));
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    return Promise.all([
      this.prisma.giftCard.findMany({
        where,
        include,
        orderBy,
        take,
        skip: offset,
      }),
      this.prisma.giftCard.count({ where }),
    ]).then(([cards, total]) => ({
      items: cards.map((card) => serializeUserGiftCard(card)),
      total,
      take,
      offset,
    }));
  }

  listReceived(userId: string, query: ListMyGiftCardsQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const where = { recipientId: userId };
    const include = {
      batch: { select: { imageUrl: true } },
      purchaser: { select: { name: true, lastName: true, avatarUrl: true } },
    };
    const orderBy = { createdAt: 'desc' as const };

    if (!hasPagination) {
      return this.prisma.giftCard
        .findMany({ where, include, orderBy })
        .then((cards) => cards.map((card) => serializeUserGiftCard(card)));
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    return Promise.all([
      this.prisma.giftCard.findMany({
        where,
        include,
        orderBy,
        take,
        skip: offset,
      }),
      this.prisma.giftCard.count({ where }),
    ]).then(([cards, total]) => ({
      items: cards.map((card) => serializeUserGiftCard(card)),
      total,
      take,
      offset,
    }));
  }

  listMarketBatches() {
    const batchDelegate = giftCardBatchDelegate(this.prisma);
    return batchDelegate
      .findMany({
        where: {
          status: GiftCardStatus.ACTIVE,
          availableQuantity: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
      .then((batches) =>
        batches.map((batch) => ({
          ...batch,
          amountAmd: readBatchAmount(batch),
          amountCents: readBatchAmount(batch),
        })),
      );
  }

  /**
   * Search active members to gift a card to (excludes the purchaser).
   * Requires a non-empty query so we never return the full directory.
   */
  searchGiftRecipients(actorId: string, query: string) {
    const token = query.trim();
    if (token.length < GIFT_RECIPIENT_SEARCH_MIN_CHARS) {
      return Promise.resolve([]);
    }
    return this.prisma.user.findMany({
      where: {
        role: 'USER',
        isBlocked: false,
        id: { not: actorId },
        OR: [
          { email: { contains: token, mode: 'insensitive' } },
          { name: { contains: token, mode: 'insensitive' } },
          { lastName: { contains: token, mode: 'insensitive' } },
          { phone: { contains: token, mode: 'insensitive' } },
        ],
      },
      select: { id: true, email: true, name: true, lastName: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      take: GIFT_RECIPIENT_SEARCH_LIMIT,
    });
  }

  async getSpendableBalance(userId: string) {
    await expireDueGiftCards(this.prisma);
    const spendableCents = await peekSpendableGiftCreditsCents(
      this.prisma,
      userId,
    );
    return { spendableCents };
  }

  async getPolicy() {
    const row = await this.prisma.studioSettings.findFirst({
      select: {
        giftCardMinAmountAmd: true,
        giftCardValidityMonths: true,
        giftCardDenominationsJson: true,
      },
    });
    return resolveGiftCardPolicy(row);
  }

  async listMyActivity(userId: string) {
    const rows = await this.prisma.giftCardTransaction.findMany({
      where: {
        OR: [{ userId }, { giftCard: { recipientId: userId } }],
      },
      include: { giftCard: { select: { code: true } } },
      orderBy: { createdAt: 'desc' },
      take: GIFT_ACTIVITY_PAGE,
    });
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      code: row.giftCard.code,
      amountAmd: row.amountAmd,
      classes: row.classes,
      balanceAmdAfter: row.balanceAmdAfter,
      balanceClassesAfter: row.balanceClassesAfter,
      orderId: row.orderId,
      createdAt: row.createdAt,
    }));
  }

  async redeem(userId: string, code: string) {
    this.redeemGuard.assertAllowed(userId);
    try {
      await expireDueGiftCards(this.prisma);
      const result = await redeemGiftCardForUser(this.prisma, userId, code);
      this.redeemGuard.recordSuccess(userId);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        this.redeemGuard.recordFailure(userId);
      }
      throw error;
    }
  }

  listAdminCards() {
    return this.prisma.giftCard
      .findMany({
        include: {
          purchaser: { select: { email: true, name: true } },
          recipient: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      .then((cards) =>
        cards.map((card) => ({
          ...card,
          amountAmd: readGiftCardAmount(card),
          balanceAmd: readGiftCardBalance(card),
          amountCents: readGiftCardAmount(card),
          balanceCents: readGiftCardBalance(card),
        })),
      );
  }
}
