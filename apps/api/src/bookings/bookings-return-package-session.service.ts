import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  hasReturnablePackageSession,
  RETURN_PACKAGE_SESSION_NOT_PAST,
  RETURN_PACKAGE_SESSION_NOTHING_HELD,
  type PackageSessionHold,
} from './bookings-return-package-session.helpers';

const HOLD_SELECT = {
  restoredAt: true,
  consumedSessions: true,
  consumedGuestSlots: true,
} as const;

type ReturnableBooking = {
  session: { endsAt: Date };
  consumptions: PackageSessionHold[];
};

@Injectable()
export class BookingsReturnPackageSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packageUsage: PackageUsageService,
  ) {}

  async returnToPackage(bookingId: string): Promise<{ ok: true }> {
    const booking = await this.loadBooking(bookingId);
    this.assertReturnable(booking, new Date());
    await this.restoreHeldCredit(bookingId);
    return { ok: true };
  }

  private async loadBooking(bookingId: string): Promise<ReturnableBooking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        session: { select: { endsAt: true } },
        consumptions: { select: HOLD_SELECT },
      },
    });
    if (booking === null) {
      throw new NotFoundException();
    }
    return booking;
  }

  private assertReturnable(booking: ReturnableBooking, now: Date): void {
    if (booking.session.endsAt.getTime() > now.getTime()) {
      throw new BadRequestException(RETURN_PACKAGE_SESSION_NOT_PAST);
    }
    if (!hasReturnablePackageSession(booking.consumptions)) {
      throw new BadRequestException(RETURN_PACKAGE_SESSION_NOTHING_HELD);
    }
  }

  private async restoreHeldCredit(bookingId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const holds = await tx.bookingConsumption.findMany({
        where: { bookingId, restoredAt: null },
        select: HOLD_SELECT,
      });
      if (!hasReturnablePackageSession(holds)) {
        throw new BadRequestException(RETURN_PACKAGE_SESSION_NOTHING_HELD);
      }
      await this.packageUsage.restoreSession({ tx, bookingId });
    });
  }
}
