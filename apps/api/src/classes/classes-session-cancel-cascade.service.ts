import { Injectable } from '@nestjs/common';
import { BookingsSlotService } from '../bookings/bookings-slot.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { WaitlistService } from '../waitlist/waitlist.service';

@Injectable()
export class ClassesSessionCancelCascadeService {
  constructor(
    private readonly slots: BookingsSlotService,
    private readonly waitlist: WaitlistService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  /**
   * After admin marks a class cancelled: cancel bookings, restore package
   * sessions (no 24h penalty), and expire waitlist.
   */
  async apply(sessionId: string): Promise<void> {
    const userIds =
      await this.slots.releaseRegistrationsForAdminCancelledSession(sessionId);
    await this.waitlist.expireForCancelledSession(sessionId);
    for (const userId of userIds) {
      this.realtime.emitBookingSessionChange({ userId, sessionId });
    }
  }
}
