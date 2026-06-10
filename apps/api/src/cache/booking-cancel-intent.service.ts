import { Injectable } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import type { PublicScheduleItem } from '../schedule/map-sessions-to-public-schedule-items';

/** How long a cancel confirmation dialog keeps a session spot held for other viewers. */
const CANCEL_INTENT_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class BookingCancelIntentService {
  private readonly intents = new Map<string, number>();

  /** Marks a session as having an in-progress member cancel confirmation. */
  register(sessionId: string): void {
    this.intents.set(sessionId, Date.now() + CANCEL_INTENT_TTL_MS);
  }

  /** Clears a held spot after the dialog is dismissed without cancelling. */
  clear(sessionId: string): void {
    this.intents.delete(sessionId);
  }

  isActive(sessionId: string): boolean {
    const expiresAt = this.intents.get(sessionId);
    if (expiresAt === undefined) {
      return false;
    }
    if (Date.now() > expiresAt) {
      this.intents.delete(sessionId);
      return false;
    }
    return true;
  }

  /** Keeps public rows full while another member is confirming a cancellation. */
  applyToPublicItems(
    items: readonly PublicScheduleItem[],
  ): PublicScheduleItem[] {
    return items.map((item) => {
      if (!this.isActive(item.id)) {
        return item;
      }
      return {
        ...item,
        availableSpots: 0,
        status: ClassSessionStatus.FULL,
      };
    });
  }
}
