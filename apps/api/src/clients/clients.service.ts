import { Injectable, NotFoundException } from "@nestjs/common";
import { MembershipStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      where: { role: Role.USER },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          take: 1,
          include: { plan: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  async get(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      include: {
        memberships: { include: { plan: true } },
        bookings: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: { session: { include: { classType: true } } },
        },
        payments: { take: 50, orderBy: { createdAt: "desc" } },
        giftCardsPurchased: { take: 20 },
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const { passwordHash: _p, ...rest } = user;
    return rest;
  }
}
