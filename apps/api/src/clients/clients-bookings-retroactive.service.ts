import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  BookingChannel,
  BookingStatus,
  ClassSessionStatus,
  type User,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { BOOKING_INTERACTIVE_TX_TIMEOUT_MS } from '../bookings/bookings.constants';
import { ownerBookingUniqueWhere } from '../bookings/bookings-guest-pass.constants';
import { resolveBookingSessionCredits } from '../bookings/resolve-booking-session-credits';
import { PackagesActivationService } from '../packages/packages-activation.service';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import {
  assertRetroactiveClientExists,
  loadActivePackageForRetroactive,
  loadOwnerBookingsBySession,
  loadSessionForRetroactiveAttach,
  RETROACTIVE_SESSION_CLASS_TYPE_SELECT,
  type RetroactiveLoadedSession,
} from './clients-bookings-retroactive-load';
import {
  RETROACTIVE_ATTACH_ERROR,
  RETROACTIVE_SESSION_LOOKBACK_DAYS,
} from './clients-bookings-retroactive.constants';
import {
  hasUnrestoredConsumption,
  isSessionAttachableToPackage,
  readOptionalAttachNote,
  resolveRetroactiveLookbackStart,
} from './clients-bookings-retroactive.helpers';
import type { AdminAttachPastSessionDto } from './dto/admin-attach-past-session.dto';

export type AttachablePastSession = {
  id: string;
  startsAt: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  hasExistingVisit: boolean;
};

@Injectable()
export class ClientsBookingsRetroactiveService {
  private readonly logger = new Logger(ClientsBookingsRetroactiveService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly packageUsage: PackageUsageService,
    private readonly packagesActivation: PackagesActivationService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  async listAttachableSessions(
    clientId: string,
    packageId: string,
  ): Promise<{ items: AttachablePastSession[]; lookbackDays: number }> {
    await assertRetroactiveClientExists(this.prisma, clientId);
    const membership = await loadActivePackageForRetroactive(
      this.prisma,
      clientId,
      packageId,
    );
    const now = new Date();
    const sessions = await this.prisma.classSession.findMany({
      where: {
        startsAt: { gte: resolveRetroactiveLookbackStart(now), lt: now },
        status: {
          notIn: [ClassSessionStatus.CANCELLED, ClassSessionStatus.DRAFT],
        },
      },
      include: {
        classType: { select: RETROACTIVE_SESSION_CLASS_TYPE_SELECT },
        coach: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startsAt: 'desc' },
    });
    const bookingBySessionId = await loadOwnerBookingsBySession(
      this.prisma,
      clientId,
      sessions.map((session) => session.id),
    );
    return {
      lookbackDays: RETROACTIVE_SESSION_LOOKBACK_DAYS,
      items: sessions
        .filter((session) =>
          isSessionAttachableToPackage(
            membership,
            session,
            bookingBySessionId.get(session.id),
          ),
        )
        .map((session) => ({
          id: session.id,
          startsAt: session.startsAt.toISOString(),
          classType: { name: session.classType.name },
          coach: { user: { name: session.coach.user.name } },
          hasExistingVisit: bookingBySessionId.has(session.id),
        })),
    };
  }

  async attachPastSession(
    actor: User,
    clientId: string,
    packageId: string,
    dto: AdminAttachPastSessionDto,
  ): Promise<{ bookingId: string; attachedExistingVisit: boolean }> {
    await assertRetroactiveClientExists(this.prisma, clientId);
    const now = new Date();
    const session = await loadSessionForRetroactiveAttach(
      this.prisma,
      dto.sessionId,
      now,
    );
    await loadActivePackageForRetroactive(this.prisma, clientId, packageId);
    const booking = await this.prisma.$transaction(
      (tx) =>
        this.persistAttach(tx, {
          actorId: actor.id,
          clientId,
          packageId,
          session,
          note: readOptionalAttachNote(dto.note),
          now,
        }),
      { timeout: BOOKING_INTERACTIVE_TX_TIMEOUT_MS },
    );
    await this.packagesActivation.activateFromCompletedBooking(booking.id);
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: clientId,
      sessionId: session.id,
    });
    this.logger.log(
      `attachPastSession clientId=${clientId} packageId=${packageId} sessionId=${session.id} bookingId=${booking.id}`,
    );
    return {
      bookingId: booking.id,
      attachedExistingVisit: booking.attachedExistingVisit,
    };
  }

  private async persistAttach(
    tx: Prisma.TransactionClient,
    params: {
      actorId: string;
      clientId: string;
      packageId: string;
      session: RetroactiveLoadedSession;
      note: string | null;
      now: Date;
    },
  ): Promise<{ id: string; attachedExistingVisit: boolean }> {
    const existing = await tx.booking.findUnique({
      where: ownerBookingUniqueWhere(params.clientId, params.session.id),
      include: { consumptions: { select: { restoredAt: true } } },
    });
    if (existing !== null && hasUnrestoredConsumption(existing.consumptions)) {
      throw new BadRequestException(RETROACTIVE_ATTACH_ERROR.ALREADY_DEDUCTED);
    }
    const membership =
      await this.packageUsage.getValidatedUserPackageForBooking({
        tx,
        userId: params.clientId,
        session: {
          id: params.session.id,
          startsAt: params.session.startsAt,
          classType: params.session.classType,
        },
        userPackageId: params.packageId,
      });
    const saved = await this.upsertCompletedBooking(tx, existing?.id, params);
    await this.packageUsage.consumeSession({
      tx,
      bookingId: saved.id,
      membership,
      sessionClassType: params.session.classType,
      requiredSessions: resolveBookingSessionCredits({
        session: params.session,
        userPackageId: params.packageId,
      }),
    });
    if (params.note !== null) {
      await tx.bookingNote.create({
        data: {
          bookingId: saved.id,
          authorId: params.actorId,
          body: params.note,
        },
      });
    }
    return { id: saved.id, attachedExistingVisit: existing !== null };
  }

  private upsertCompletedBooking(
    tx: Prisma.TransactionClient,
    existingId: string | undefined,
    params: {
      clientId: string;
      session: RetroactiveLoadedSession;
      now: Date;
    },
  ) {
    if (existingId === undefined) {
      return tx.booking.create({
        data: {
          userId: params.clientId,
          sessionId: params.session.id,
          status: BookingStatus.COMPLETED,
          channel: BookingChannel.WEBSITE,
          attendedAt: params.now,
        },
      });
    }
    return tx.booking.update({
      where: { id: existingId },
      data: {
        status: BookingStatus.COMPLETED,
        cancelledAt: null,
        attendedAt: params.now,
      },
    });
  }
}
