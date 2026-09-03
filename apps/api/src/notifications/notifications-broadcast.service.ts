import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { MailService } from '../mail/mail.service';
import { htmlToWhatsappText } from '../whatsapp/whatsapp-html-text';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import { renderBroadcastWhatsapp } from '../whatsapp/whatsapp-commerce-templates';
import { renderBroadcastEmail } from '../mail/templates/broadcast.template';
import { PrismaService } from '../prisma/prisma.service';
import { BroadcastAudience } from './dto/broadcast.dto';
import type { AdminListScheduledQueryDto } from './dto/admin-list-scheduled-query.dto';
import {
  ACTION_BROADCAST,
  ACTION_BROADCAST_SCHEDULED,
  ACTION_BROADCAST_SCHEDULED_CANCELLED,
  ACTION_BROADCAST_SCHEDULED_FAILED,
  ACTION_BROADCAST_SCHEDULED_SENT,
  ACTION_BROADCAST_SCHEDULED_UPDATED,
  ACTION_NOTIFICATION_DELIVERY,
  SCHEDULED_TIMELINE_ACTIONS,
} from './notifications-audit.constants';
import {
  filterScheduledRows,
  NOTIFICATIONS_FILTER_SCAN_LIMIT,
  paginateFilteredRows,
  requiresScheduledPostProcessing,
} from './notifications-list-filters';
import { fetchAndMapScheduledBroadcasts } from './notifications-scheduled.mapper';
import {
  hasScheduledTerminalStatus,
  resolveAudienceRoles,
  resolveEffectiveScheduledPayload,
} from './notifications-payload.helpers';

@Injectable()
export class NotificationsBroadcastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly whatsapp: WhatsappNotifyService,
  ) {}

  async broadcastToAll(
    subject: string,
    html: string,
    options: {
      testTo?: string;
      audience: BroadcastAudience;
      onlyPromotionsOptIn: boolean;
      scheduleEntityId?: string;
    },
  ) {
    const brandedHtml = renderBroadcastEmail(subject, html);
    if (options.testTo) {
      await this.mail.sendEmail({
        to: options.testTo,
        subject,
        html: brandedHtml,
      });
      return { ok: true, mode: 'test' };
    }
    const roles = resolveAudienceRoles(options.audience);
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: roles },
        ...(options.onlyPromotionsOptIn && roles.includes(Role.USER)
          ? { notificationPrefs: { is: { promotions: true } } }
          : {}),
      },
      select: { id: true, email: true, locale: true },
      take: 500,
    });
    const whatsappBody = htmlToWhatsappText(html);
    for (const user of users) {
      await this.deliverBroadcastRecipient({
        user,
        subject,
        brandedHtml,
        whatsappBody,
        audience: options.audience,
        scheduleEntityId: options.scheduleEntityId,
      });
    }
    await this.audit.log({
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST,
      entityType: 'Notification',
      entityId: 'broadcast',
      payload: {
        subject,
        recipientCount: users.length,
        audience: options.audience,
        onlyPromotionsOptIn: options.onlyPromotionsOptIn,
      },
    });
    return { ok: true, count: users.length };
  }

  private async deliverBroadcastRecipient(params: {
    user: { id: string; email: string; locale: string };
    subject: string;
    brandedHtml: string;
    whatsappBody: string;
    audience: BroadcastAudience;
    scheduleEntityId?: string;
  }): Promise<void> {
    await this.mail.sendEmail({
      to: params.user.email,
      subject: params.subject,
      html: params.brandedHtml,
    });
    await this.audit.log({
      actorRole: 'ADMIN',
      action: ACTION_NOTIFICATION_DELIVERY,
      entityType: 'Notification',
      entityId: params.scheduleEntityId ?? 'immediate',
      payload: {
        recipientEmail: params.user.email,
        channel: 'email',
        audience: params.audience,
        scheduled: params.scheduleEntityId !== undefined,
        subject: params.subject,
      },
    });
    await this.whatsapp.trySendToUser({
      userId: params.user.id,
      topic: 'promotions',
      render: (locale) =>
        renderBroadcastWhatsapp(locale, {
          subject: params.subject,
          body: params.whatsappBody,
        }),
    });
  }

  async scheduleBroadcast(
    actorId: string,
    params: {
      subject: string;
      html: string;
      audience: BroadcastAudience;
      onlyPromotionsOptIn: boolean;
      scheduleAt: string;
    },
  ) {
    const scheduledFor = new Date(params.scheduleAt);
    if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
      return this.broadcastToAll(params.subject, params.html, {
        audience: params.audience,
        onlyPromotionsOptIn: params.onlyPromotionsOptIn,
      });
    }
    const entityId = randomUUID();
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED,
      entityType: 'Notification',
      entityId,
      payload: {
        subject: params.subject,
        html: params.html,
        audience: params.audience,
        onlyPromotionsOptIn: params.onlyPromotionsOptIn,
        scheduleAt: scheduledFor.toISOString(),
      },
    });
    return {
      ok: true,
      mode: 'scheduled',
      scheduledFor: scheduledFor.toISOString(),
      scheduleId: entityId,
    };
  }

  async listScheduledBroadcasts(query: AdminListScheduledQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const where = {
      action: ACTION_BROADCAST_SCHEDULED,
      entityType: 'Notification',
    };
    const orderBy = { createdAt: 'desc' as const };
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;

    if (!hasPagination) {
      const scheduled = await this.prisma.auditLog.findMany({
        where,
        orderBy,
        take: 200,
      });
      return fetchAndMapScheduledBroadcasts(this.prisma, scheduled);
    }

    if (requiresScheduledPostProcessing(query)) {
      const scheduled = await this.prisma.auditLog.findMany({
        where,
        orderBy,
        take: NOTIFICATIONS_FILTER_SCAN_LIMIT,
      });
      const mapped = await fetchAndMapScheduledBroadcasts(
        this.prisma,
        scheduled,
      );
      return paginateFilteredRows(
        filterScheduledRows(mapped, query),
        take,
        offset,
      );
    }

    const [scheduled, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, orderBy, take, skip: offset }),
      this.prisma.auditLog.count({ where }),
    ]);
    const items = await fetchAndMapScheduledBroadcasts(this.prisma, scheduled);
    return { items, total, take, offset };
  }

  async updateScheduledBroadcast(
    actorId: string,
    id: string,
    changes: {
      subject?: string;
      html?: string;
      audience?: BroadcastAudience;
      onlyPromotionsOptIn?: boolean;
      scheduleAt?: string;
    },
  ) {
    const base = await this.prisma.auditLog.findFirst({
      where: {
        action: ACTION_BROADCAST_SCHEDULED,
        entityType: 'Notification',
        entityId: id,
      },
    });
    if (!base) {
      throw new NotFoundException('Scheduled broadcast not found');
    }
    const timeline = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Notification',
        entityId: id,
        action: { in: [...SCHEDULED_TIMELINE_ACTIONS] },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    if (hasScheduledTerminalStatus(timeline)) {
      throw new BadRequestException(
        'Cannot update non-pending scheduled broadcast',
      );
    }
    const effective = resolveEffectiveScheduledPayload(base.payload, timeline);
    if (!effective) {
      throw new BadRequestException('Invalid scheduled broadcast payload');
    }
    const next = {
      subject: changes.subject ?? effective.subject,
      html: changes.html ?? effective.html,
      audience: changes.audience ?? effective.audience,
      onlyPromotionsOptIn:
        changes.onlyPromotionsOptIn ?? effective.onlyPromotionsOptIn,
      scheduleAt: changes.scheduleAt ?? effective.scheduleAt,
    };
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED_UPDATED,
      entityType: 'Notification',
      entityId: id,
      payload: next,
    });
    return { ok: true };
  }

  async cancelScheduledBroadcast(actorId: string, id: string) {
    const base = await this.prisma.auditLog.findFirst({
      where: {
        action: ACTION_BROADCAST_SCHEDULED,
        entityType: 'Notification',
        entityId: id,
      },
    });
    if (!base) {
      throw new NotFoundException('Scheduled broadcast not found');
    }
    const timeline = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Notification',
        entityId: id,
        action: {
          in: [
            ACTION_BROADCAST_SCHEDULED_CANCELLED,
            ACTION_BROADCAST_SCHEDULED_SENT,
            ACTION_BROADCAST_SCHEDULED_FAILED,
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    if (hasScheduledTerminalStatus(timeline)) {
      throw new BadRequestException('Scheduled broadcast is already closed');
    }
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED_CANCELLED,
      entityType: 'Notification',
      entityId: id,
      payload: { reason: 'Cancelled by admin' },
    });
    return { ok: true };
  }
}
