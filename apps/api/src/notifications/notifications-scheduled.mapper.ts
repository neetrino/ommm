import type { PrismaService } from '../prisma/prisma.service';
import { SCHEDULED_TIMELINE_ACTIONS } from './notifications-audit.constants';
import {
  groupTimelineByEntityId,
  mapScheduledBroadcastItems,
} from './notifications-payload.helpers';

type AuditLogReader = Pick<PrismaService, 'auditLog'>;

export async function fetchAndMapScheduledBroadcasts(
  prisma: AuditLogReader,
  scheduled: Array<{
    entityId: string;
    createdAt: Date;
    payload: string | null;
  }>,
) {
  if (scheduled.length === 0) {
    return [];
  }
  const timeline = await prisma.auditLog.findMany({
    where: {
      entityType: 'Notification',
      entityId: { in: scheduled.map((item) => item.entityId) },
      action: { in: [...SCHEDULED_TIMELINE_ACTIONS] },
    },
    orderBy: { createdAt: 'asc' },
    take: 2000,
  });
  const timelineByEntityId = groupTimelineByEntityId(timeline);
  return mapScheduledBroadcastItems(scheduled, timelineByEntityId);
}
