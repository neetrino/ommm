import { Role } from '@prisma/client';
import { BroadcastAudience } from './dto/broadcast.dto';
import {
  ACTION_BROADCAST_SCHEDULED_CANCELLED,
  ACTION_BROADCAST_SCHEDULED_FAILED,
  ACTION_BROADCAST_SCHEDULED_SENT,
  ACTION_BROADCAST_SCHEDULED_UPDATED,
} from './notifications-audit.constants';

export type ScheduledBroadcastPayload = {
  subject: string;
  html: string;
  audience: BroadcastAudience;
  onlyPromotionsOptIn: boolean;
  scheduleAt: string;
};

export type ScheduledBroadcastStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export type TimelineEntry = {
  action: string;
  payload: string | null;
  createdAt: Date;
};

export function resolveAudienceRoles(audience: BroadcastAudience): Role[] {
  if (audience === BroadcastAudience.COACHES) {
    return [Role.COACH];
  }
  if (audience === BroadcastAudience.STAFF) {
    return [Role.COACH, Role.MANAGER, Role.CONTENT_ADMIN, Role.ADMIN];
  }
  if (audience === BroadcastAudience.ALL) {
    return [
      Role.USER,
      Role.COACH,
      Role.MANAGER,
      Role.CONTENT_ADMIN,
      Role.ADMIN,
    ];
  }
  return [Role.USER];
}

export function parseScheduledPayload(
  rawPayload: string | null,
): ScheduledBroadcastPayload | null {
  if (!rawPayload) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawPayload) as Partial<ScheduledBroadcastPayload>;
    if (
      !parsed.subject ||
      !parsed.html ||
      !parsed.audience ||
      !parsed.scheduleAt
    ) {
      return null;
    }
    return {
      subject: parsed.subject,
      html: parsed.html,
      audience: parsed.audience,
      onlyPromotionsOptIn: parsed.onlyPromotionsOptIn === true,
      scheduleAt: parsed.scheduleAt,
    };
  } catch {
    return null;
  }
}

export function parseBroadcastPayload(rawPayload: string | null): {
  audience: 'users' | 'coaches' | 'staff' | 'all';
} | null {
  if (!rawPayload) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawPayload) as Partial<{
      audience: 'users' | 'coaches' | 'staff' | 'all';
    }>;
    if (!parsed.audience) {
      return null;
    }
    return { audience: parsed.audience };
  } catch {
    return null;
  }
}

export function parseBroadcastCampaignPayload(rawPayload: string | null): {
  subject: string;
  recipientCount: number;
} | null {
  if (!rawPayload) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawPayload) as Partial<{
      subject: string;
      recipientCount: number;
      sentCount: number;
    }>;
    if (typeof parsed.subject !== 'string') {
      return null;
    }
    return {
      subject: parsed.subject,
      recipientCount:
        typeof parsed.recipientCount === 'number'
          ? parsed.recipientCount
          : typeof parsed.sentCount === 'number'
            ? parsed.sentCount
            : 0,
    };
  } catch {
    return null;
  }
}

export function parseDeliveryPayload(rawPayload: string | null): {
  recipientEmail: string;
  channel: string;
  audience: 'users' | 'coaches' | 'staff' | 'all';
  scheduled: boolean;
  subject: string;
} | null {
  if (!rawPayload) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawPayload) as Partial<{
      recipientEmail: string;
      channel: string;
      audience: 'users' | 'coaches' | 'staff' | 'all';
      scheduled: boolean;
      subject: string;
    }>;
    if (
      !parsed.recipientEmail ||
      !parsed.channel ||
      !parsed.audience ||
      !parsed.subject
    ) {
      return null;
    }
    return {
      recipientEmail: parsed.recipientEmail,
      channel: parsed.channel,
      audience: parsed.audience,
      scheduled: parsed.scheduled === true,
      subject: parsed.subject,
    };
  } catch {
    return null;
  }
}

export function resolveScheduledStatus(
  timeline: Array<{ action: string }>,
): ScheduledBroadcastStatus {
  if (
    timeline.some(
      (item) => item.action === ACTION_BROADCAST_SCHEDULED_CANCELLED,
    )
  ) {
    return 'CANCELLED';
  }
  if (
    timeline.some((item) => item.action === ACTION_BROADCAST_SCHEDULED_SENT)
  ) {
    return 'SENT';
  }
  if (
    timeline.some((item) => item.action === ACTION_BROADCAST_SCHEDULED_FAILED)
  ) {
    return 'FAILED';
  }
  return 'PENDING';
}

export function hasScheduledTerminalStatus(
  timeline: Array<{ action: string }>,
): boolean {
  return resolveScheduledStatus(timeline) !== 'PENDING';
}

export function groupTimelineByEntityId(
  timeline: Array<{
    entityId: string;
    action: string;
    payload: string | null;
    createdAt: Date;
  }>,
): Map<string, TimelineEntry[]> {
  const grouped = new Map<string, TimelineEntry[]>();
  for (const item of timeline) {
    const prev = grouped.get(item.entityId) ?? [];
    prev.push({
      action: item.action,
      payload: item.payload,
      createdAt: item.createdAt,
    });
    grouped.set(item.entityId, prev);
  }
  return grouped;
}

export function resolveEffectiveScheduledPayload(
  basePayloadRaw: string | null,
  timeline: Array<{ action: string; payload: string | null }>,
): ScheduledBroadcastPayload | null {
  const base = parseScheduledPayload(basePayloadRaw);
  if (!base) {
    return null;
  }
  return timeline
    .filter((item) => item.action === ACTION_BROADCAST_SCHEDULED_UPDATED)
    .reduce((acc, item) => {
      const next = parseScheduledPayload(item.payload);
      if (!next) {
        return acc;
      }
      return next;
    }, base);
}

export function composeDailyRows(params: {
  from: Date;
  to: Date;
  campaignsByDate: Map<string, number>;
  deliveriesByDate: Map<string, number>;
}): Array<{ date: string; campaigns: number; deliveries: number }> {
  const rows: Array<{ date: string; campaigns: number; deliveries: number }> =
    [];
  const cursor = new Date(params.from);
  while (cursor <= params.to) {
    const date = cursor.toISOString().slice(0, 10);
    rows.push({
      date,
      campaigns: params.campaignsByDate.get(date) ?? 0,
      deliveries: params.deliveriesByDate.get(date) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return rows;
}

export function mapScheduledBroadcastItems(
  scheduled: Array<{
    entityId: string;
    createdAt: Date;
    payload: string | null;
  }>,
  timelineByEntityId: Map<string, TimelineEntry[]>,
) {
  return scheduled.map((item) => {
    const timelineForItem = timelineByEntityId.get(item.entityId) ?? [];
    const effective = resolveEffectiveScheduledPayload(
      item.payload,
      timelineForItem,
    );
    const status = resolveScheduledStatus(timelineForItem);
    return {
      id: item.entityId,
      status,
      createdAt: item.createdAt.toISOString(),
      updatedAt:
        timelineForItem[timelineForItem.length - 1]?.createdAt.toISOString() ??
        item.createdAt.toISOString(),
      ...(effective ?? {
        subject: '',
        html: '',
        audience: BroadcastAudience.USERS,
        onlyPromotionsOptIn: false,
        scheduleAt: item.createdAt.toISOString(),
      }),
    };
  });
}

export function isEnabledEnv(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}
