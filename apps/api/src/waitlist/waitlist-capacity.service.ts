import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistCapacityService {
  constructor(private readonly prisma: PrismaService) {}

  bookedCount(sessionId: string): Promise<number> {
    return this.prisma.booking.count({
      where: { sessionId, status: BookingStatus.BOOKED },
    });
  }

  async isFull(sessionId: string, capacity: number): Promise<boolean> {
    const n = await this.bookedCount(sessionId);
    return n >= capacity;
  }
}
