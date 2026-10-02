import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { AuditService } from '../audit/audit.service';
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
import { didRedeemJustLock } from './gift-card-redeem-guard';
import { buildGiftCardPdf } from './gift-card-pdf';
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
    private readonly audit: AuditService,
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
        include: { classType: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
      .then((batches) =>
        batches.map((batch) => ({
          ...batch,
          amountAmd: readBatchAmount(batch),
          amountCents: readBatchAmount(batch),
          classTypeName: readMarketClassTypeName(batch),
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
      if (this.redeemGuard.recordSuccess(userId)) {
        await this.audit.log({
          action: 'GIFT_REDEEM_BURST',
          entityType: 'User',
          entityId: userId,
          actorId: userId,
          payload: { successes: 5 },
        });
      }
      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        await this.auditRedeemLock(userId);
      }
      throw error;
    }
  }

  async buildOwnedPdf(userId: string, cardId: string): Promise<Buffer> {
    const card = await this.prisma.giftCard.findFirst({
      where: {
        id: cardId,
        OR: [{ purchaserId: userId }, { recipientId: userId }],
      },
    });
    if (card === null) {
      throw new NotFoundException('Gift card not found');
    }
    const amountLabel =
      card.type === 'FIXED_CLASS'
        ? `${card.classQuantity} classes`
        : `${card.amountAmd} AMD`;
    return buildGiftCardPdf({
      code: card.code,
      amountLabel,
      message: card.message ?? undefined,
    });
  }

  private async auditRedeemLock(userId: string): Promise<void> {
    const state = this.redeemGuard.recordFailure(userId);
    if (!didRedeemJustLock(state)) {
      return;
    }
    await this.audit.log({
      action: 'GIFT_REDEEM_LOCKED',
      entityType: 'User',
      entityId: userId,
      actorId: userId,
      payload: { failures: state.failures },
    });
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

function readMarketClassTypeName(batch: Record<string, unknown>): string | null {
  const classType = batch.classType;
  if (typeof classType !== 'object' || classType === null || !('name' in classType)) {
    return null;
  }
  const name = classType.name;
  return typeof name === 'string' && name.trim().length > 0 ? name : null;
}
