import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';
import { readBookSessionIdFromMetadata } from '../packages/package-payment-metadata.util';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { ownerBookingUniqueWhere } from './bookings-guest-pass.constants';
import { isMemberBookingClosed } from './bookings-member-window';

export type PackageBookIntentStatus =
  | 'none'
  | 'ready'
  | 'pending_payment'
  | 'already_booked'
  | 'full'
  | 'started'
  | 'closed'
  | 'unavailable'
  | 'not_covered';

export type PackageBookIntent = {
  status: PackageBookIntentStatus;
  session: {
    id: string;
    title: string;
    coachName: string;
    startsAt: string;
    endsAt: string;
  } | null;
};

type IntentSession = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  status: ClassSessionStatus;
  classType: { id: string; name: string };
  coach: { user: { name: string | null; lastName: string | null } };
};

@Injectable()
export class PackageBookIntentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packages: PackageUsageService,
    private readonly waitlist: WaitlistService,
  ) {}

  async read(userId: string, reference: string): Promise<PackageBookIntent> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        userId,
        paymentReference: reference,
        source: PaymentSource.PACKAGE,
      },
      select: { status: true, metadata: true },
    });
    const sessionId = readBookSessionIdFromMetadata(payment?.metadata ?? null);
    if (payment === null || sessionId === null) {
      return { status: 'none', session: null };
    }
    const session = await this.loadSession(sessionId);
    if (session === null) {
      return { status: 'none', session: null };
    }
    const status = await this.resolveStatus(userId, payment.status, session);
    return { status, session: toIntentSession(session) };
  }

  private async loadSession(sessionId: string): Promise<IntentSession | null> {
    return this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        capacity: true,
        status: true,
        classType: { select: { id: true, name: true } },
        coach: {
          select: { user: { select: { name: true, lastName: true } } },
        },
      },
    });
  }

  private async resolveStatus(
    userId: string,
    paymentStatus: PaymentStatus,
    session: IntentSession,
  ): Promise<PackageBookIntentStatus> {
    if (paymentStatus === PaymentStatus.PENDING) {
      return 'pending_payment';
    }
    if (paymentStatus !== PaymentStatus.SUCCEEDED) {
      return 'none';
    }
    if (sessionUnavailable(session)) {
      return 'unavailable';
    }
    if (session.startsAt < new Date()) {
      return 'started';
    }
    if (isMemberBookingClosed(session.startsAt)) {
      return 'closed';
    }
    const existing = await this.prisma.booking.findUnique({
      where: ownerBookingUniqueWhere(userId, session.id),
      select: { status: true },
    });
    if (existing?.status === BookingStatus.BOOKED) {
      return 'already_booked';
    }
    const booked = await this.waitlist.bookedCount(session.id);
    if (booked >= session.capacity) {
      return 'full';
    }
    const eligible = await this.packages.listEligibleUserPackages({
      userId,
      session: {
        id: session.id,
        startsAt: session.startsAt,
        classType: session.classType,
      },
    });
    return eligible.length > 0 ? 'ready' : 'not_covered';
  }
}

function sessionUnavailable(session: IntentSession): boolean {
  return (
    session.status === ClassSessionStatus.CANCELLED ||
    session.status === ClassSessionStatus.FINISHED
  );
}

function toIntentSession(session: IntentSession): PackageBookIntent['session'] {
  const coachName = [session.coach.user.name, session.coach.user.lastName]
    .filter((part) => part && part.trim().length > 0)
    .join(' ');
  return {
    id: session.id,
    title: session.title.trim(),
    coachName,
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
  };
}
