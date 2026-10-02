import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { peekGiftClassSessions } from '../gift-cards/gift-card-class-credit';
import { peekSpendableGiftCreditsCents } from '../packages/package-gift-credits.util';
import { resolveFinalPriceCents } from '../packages/packages-plan.helpers';
import type { CreateCartCheckoutDto } from './dto/create-cart-checkout.dto';

export type CartLineSnapshot = {
  packagePlanId: string | null;
  sessionId: string | null;
  classTypeId: string | null;
  barProductId: string | null;
  packageCents: number;
  sessionCents: number;
  barCents: number;
  classSessionsAvailable: number;
  spendableGiftCents: number;
};

export async function loadCartLines(
  prisma: PrismaService,
  userId: string,
  dto: CreateCartCheckoutDto,
): Promise<CartLineSnapshot> {
  const packagePlanId = cleanId(dto.packagePlanId);
  const sessionId = cleanId(dto.sessionId);
  const barProductId = cleanId(dto.barProductId);
  if (packagePlanId === null && sessionId === null && barProductId === null) {
    throw new BadRequestException('Choose a package, a class, or a bar item');
  }
  const plan = await readPlan(prisma, packagePlanId);
  const session = await readSession(prisma, sessionId);
  const bar = await readBar(prisma, barProductId);
  return {
    packagePlanId,
    sessionId,
    classTypeId: session?.classTypeId ?? null,
    barProductId,
    packageCents: plan,
    sessionCents: session?.priceCents ?? 0,
    barCents: bar,
    classSessionsAvailable: await readClassSessions(
      prisma,
      userId,
      session?.classTypeId,
    ),
    spendableGiftCents: dto.useGiftCredits
      ? await peekSpendableGiftCreditsCents(prisma, userId)
      : 0,
  };
}

function cleanId(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

async function readPlan(
  prisma: PrismaService,
  planId: string | null,
): Promise<number> {
  if (planId === null) {
    return 0;
  }
  const plan = await prisma.packagePlan.findUnique({ where: { id: planId } });
  if (plan === null || !plan.isActive) {
    throw new NotFoundException('Package plan not found');
  }
  return resolveFinalPriceCents(plan);
}

async function readSession(prisma: PrismaService, sessionId: string | null) {
  if (sessionId === null) {
    return null;
  }
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
  });
  if (session === null || session.status === ClassSessionStatus.CANCELLED) {
    throw new NotFoundException('Session is not available');
  }
  if (
    session.startsAt < new Date() ||
    session.status === ClassSessionStatus.FULL
  ) {
    throw new BadRequestException('Session is not available');
  }
  return session;
}

async function readBar(
  prisma: PrismaService,
  barProductId: string | null,
): Promise<number> {
  if (barProductId === null) {
    return 0;
  }
  const product = await prisma.barProduct.findUnique({
    where: { id: barProductId },
  });
  if (product === null || !product.active) {
    throw new NotFoundException('Bar item not found');
  }
  return product.priceAmd;
}

async function readClassSessions(
  prisma: PrismaService,
  userId: string,
  classTypeId: string | null | undefined,
): Promise<number> {
  if (!classTypeId) {
    return 0;
  }
  return peekGiftClassSessions(prisma, { userId, classTypeId });
}
