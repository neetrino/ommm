import { Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import {
  ACTION_BROADCAST_SCHEDULED_FAILED,
  ACTION_BROADCAST_SCHEDULED_SENT,
} from './notifications-audit.constants';
import { NotificationsBroadcastService } from './notifications-broadcast.service';
import type { ScheduledBroadcastPayload } from './notifications-payload.helpers';

type ScheduledDispatchDeps = {
  broadcast: NotificationsBroadcastService;
  audit: AuditService;
  logger: Logger;
};

/** Sends one due broadcast and writes the sent or failed audit row. */
export async function deliverDueScheduledBroadcast(
  deps: ScheduledDispatchDeps,
  item: { id: string; entityId: string },
  payload: ScheduledBroadcastPayload,
): Promise<void> {
  try {
    const sent = await deps.broadcast.broadcastToAll(
      payload.subject,
      payload.html,
      {
        audience: payload.audience,
        onlyPromotionsOptIn: payload.onlyPromotionsOptIn,
        scheduleEntityId: item.entityId,
      },
    );
    await deps.audit.log({
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED_SENT,
      entityType: 'Notification',
      entityId: item.entityId,
      payload: {
        scheduledFor: payload.scheduleAt,
        sentCount: sent.count ?? 0,
      },
    });
  } catch (error) {
    deps.logger.error(
      `Scheduled broadcast dispatch failed for ${item.id}`,
      error instanceof Error ? error.stack : undefined,
    );
    await deps.audit.log({
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED_FAILED,
      entityType: 'Notification',
      entityId: item.entityId,
      payload: {
        scheduledFor: payload.scheduleAt,
        error: error instanceof Error ? error.message : 'unknown',
      },
    });
  }
}
