import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BookingsService } from '../bookings/bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateClientBookingDto } from './dto/admin-create-client-booking.dto';

@Injectable()
export class ClientsBookingsCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookings: BookingsService,
  ) {}

  async createForClient(clientId: string, dto: AdminCreateClientBookingDto) {
    const client = await this.prisma.user.findFirst({
      where: { id: clientId, role: Role.USER },
      select: { id: true },
    });
    if (client === null) {
      throw new NotFoundException('Client not found');
    }
    return this.bookings.book(clientId, dto.sessionId, {
      userPackageId: dto.userPackageId,
    });
  }

  async listEligiblePackages(clientId: string, sessionId: string) {
    const client = await this.prisma.user.findFirst({
      where: { id: clientId, role: Role.USER },
      select: { id: true },
    });
    if (client === null) {
      throw new NotFoundException('Client not found');
    }
    return this.bookings.listEligiblePackagesForSession(clientId, sessionId);
  }
}
