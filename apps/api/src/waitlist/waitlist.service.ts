import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminWaitlistActiveQueryDto } from './dto/admin-waitlist-active-query.dto';
import { WaitlistAdminListService } from './waitlist-admin-list.service';
import { WaitlistAdminService } from './waitlist-admin.service';
import { WaitlistCapacityService } from './waitlist-capacity.service';
import { WaitlistClientService } from './waitlist-client.service';
import { WaitlistOffersService } from './waitlist-offers.service';

@Injectable()
export class WaitlistService {
  constructor(
    private readonly capacity: WaitlistCapacityService,
    private readonly client: WaitlistClientService,
    private readonly admin: WaitlistAdminService,
    private readonly adminList: WaitlistAdminListService,
    private readonly offers: WaitlistOffersService,
  ) {}

  bookedCount(sessionId: string) {
    return this.capacity.bookedCount(sessionId);
  }

  isFull(sessionId: string, capacity: number) {
    return this.capacity.isFull(sessionId, capacity);
  }

  join(userId: string, sessionId: string) {
    return this.client.join(userId, sessionId);
  }

  leave(userId: string, sessionId: string) {
    return this.client.leave(userId, sessionId);
  }

  listMine(userId: string) {
    return this.client.listMine(userId);
  }

  listForSession(sessionId: string, actor?: { id: string; role: Role }) {
    return this.client.listForSession(sessionId, actor);
  }

  listAdminRecent(take: number) {
    return this.admin.listAdminRecent(take);
  }

  listAdminActive(query: AdminWaitlistActiveQueryDto = {}) {
    return this.adminList.listAdminActive(query);
  }

  offerNextIfSlot(sessionId: string) {
    return this.offers.offerNextIfSlot(sessionId);
  }

  expireForCancelledSession(sessionId: string) {
    return this.offers.expireForCancelledSession(sessionId);
  }

  expireOffersCron() {
    return this.offers.expireOffersCron();
  }

  expireStaleOffersAndPromote() {
    return this.offers.expireStaleOffersAndPromote();
  }

  remove(entryId: string) {
    return this.admin.remove(entryId);
  }

  promoteToBooking(entryId: string, targetSessionId: string) {
    return this.admin.promoteToBooking(entryId, targetSessionId);
  }

  manualNotify(
    entryId: string,
    payload: {
      subject?: string;
      message?: string;
      actorId?: string;
      actorRole?: Role;
    },
  ) {
    return this.admin.manualNotify(entryId, payload);
  }
}
