import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, UserPackageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminUpdateUserPackageValidityDto } from './dto/admin-update-user-package-validity.dto';

/**
 * Admin adjusts a client's package validity window (incl. expired → active).
 */
@Injectable()
export class PackagesAdminValidityService {
  constructor(private readonly prisma: PrismaService) {}

  async updateValidity(
    userPackageId: string,
    dto: AdminUpdateUserPackageValidityDto,
  ) {
    const existing = await this.prisma.userPackage.findUnique({
      where: { id: userPackageId },
      include: {
        user: { select: { id: true, role: true } },
      },
    });
    if (existing === null || existing.user.role !== Role.USER) {
      throw new NotFoundException('User package not found');
    }

    const currentPeriodEnd = new Date(dto.currentPeriodEnd);
    if (Number.isNaN(currentPeriodEnd.getTime())) {
      throw new BadRequestException('Invalid expiration date');
    }

    const currentPeriodStart =
      dto.currentPeriodStart !== undefined
        ? new Date(dto.currentPeriodStart)
        : existing.currentPeriodStart;
    if (Number.isNaN(currentPeriodStart.getTime())) {
      throw new BadRequestException('Invalid activation date');
    }
    if (currentPeriodEnd.getTime() <= currentPeriodStart.getTime()) {
      throw new BadRequestException('Expiration must be after activation date');
    }

    const now = new Date();
    let nextStatus = existing.status;
    if (
      existing.status === UserPackageStatus.EXPIRED &&
      currentPeriodEnd.getTime() > now.getTime()
    ) {
      nextStatus = UserPackageStatus.ACTIVE;
    } else if (
      existing.status === UserPackageStatus.ACTIVE &&
      currentPeriodEnd.getTime() <= now.getTime()
    ) {
      nextStatus = UserPackageStatus.EXPIRED;
    }

    const updated = await this.prisma.userPackage.update({
      where: { id: userPackageId },
      data: {
        currentPeriodStart,
        currentPeriodEnd,
        status: nextStatus,
        awaitingFirstVisit: false,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      currentPeriodStart: updated.currentPeriodStart.toISOString(),
      currentPeriodEnd: updated.currentPeriodEnd.toISOString(),
    };
  }
}
