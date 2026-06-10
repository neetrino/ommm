import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { Role } from '@prisma/client';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  REALTIME_EVENT_ID_STEP,
  REALTIME_HEARTBEAT_MS,
  REALTIME_MAX_PUBLIC_CONNECTIONS_PER_IP,
} from './realtime.constants';
import {
  applySseResponseHeaders,
  resolveClientIp,
  writeSseComment,
  writeSseFrame,
} from './realtime-sse.util';
import {
  REALTIME_EVENT_NAMES,
  type PrivateRealtimeEvent,
  type PublicRealtimeEvent,
  type RealtimeEvent,
  type SseOutboundFrame,
} from './realtime.types';

type StreamKind = 'public' | 'authenticated';

type RealtimeStreamHandle = {
  id: string;
  kind: StreamKind;
  res: Response;
  userId?: string;
  role?: Role;
  ip: string;
  heartbeatId: ReturnType<typeof setInterval>;
};

@Injectable()
export class RealtimePublisherService {
  private readonly logger = new Logger(RealtimePublisherService.name);
  private readonly streams = new Map<string, RealtimeStreamHandle>();
  private nextEventId = 1;

  get activeConnectionCount(): number {
    return this.streams.size;
  }

  attachPublicStream(
    res: Response,
    reqIp: string | undefined,
    forwardedFor?: string | string[],
  ): () => void {
    const ip = resolveClientIp(reqIp, forwardedFor);
    const activeForIp = [...this.streams.values()].filter(
      (stream) => stream.kind === 'public' && stream.ip === ip,
    ).length;
    if (activeForIp >= REALTIME_MAX_PUBLIC_CONNECTIONS_PER_IP) {
      throw new HttpException(
        'Too many public realtime connections',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return this.attachStream(res, { kind: 'public', ip });
  }

  attachAuthenticatedStream(
    res: Response,
    user: { id: string; role: Role },
    reqIp: string | undefined,
    forwardedFor?: string | string[],
  ): () => void {
    const ip = resolveClientIp(reqIp, forwardedFor);
    return this.attachStream(res, {
      kind: 'authenticated',
      ip,
      userId: user.id,
      role: user.role,
    });
  }

  emitPublic(event: PublicRealtimeEvent): void {
    const frame = this.toFrame(event);
    for (const stream of this.streams.values()) {
      writeSseFrame(stream.res, frame);
    }
  }

  emitToUser(userId: string, event: PrivateRealtimeEvent): void {
    const frame = this.toFrame(event);
    for (const stream of this.streams.values()) {
      if (stream.kind !== 'authenticated' || stream.userId !== userId) {
        continue;
      }
      writeSseFrame(stream.res, frame);
    }
  }

  emit(event: RealtimeEvent): void {
    if (this.isPublicEvent(event)) {
      this.emitPublic(event);
      return;
    }
    this.emitToUser(event.data.userId, event);
  }

  emitBookingSessionChange(params: {
    userId: string;
    sessionId: string;
  }): void {
    this.emitToUser(params.userId, {
      type: REALTIME_EVENT_NAMES.BOOKING_CHANGED,
      data: { userId: params.userId, sessionId: params.sessionId },
    });
    this.emitPublicScheduleSession(params.sessionId);
  }

  emitPublicScheduleSession(sessionId: string): void {
    this.emitPublic({
      type: REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE,
      data: { sessionId },
    });
    this.emitPublic({
      type: REALTIME_EVENT_NAMES.SESSION_CHANGED,
      data: { sessionId },
    });
  }

  emitCancelIntentChanged(sessionId: string): void {
    this.emitPublic({
      type: REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED,
      data: { sessionId },
    });
  }

  emitWaitlistChanged(userId: string, sessionId: string): void {
    this.emitToUser(userId, {
      type: REALTIME_EVENT_NAMES.WAITLIST_CHANGED,
      data: { userId, sessionId },
    });
  }

  emitWaitlistOffer(userId: string, sessionId: string): void {
    this.emitToUser(userId, {
      type: REALTIME_EVENT_NAMES.WAITLIST_OFFER,
      data: { userId, sessionId },
    });
    this.emitWaitlistChanged(userId, sessionId);
  }

  private attachStream(
    res: Response,
    meta: {
      kind: StreamKind;
      ip: string;
      userId?: string;
      role?: Role;
    },
  ): () => void {
    applySseResponseHeaders(res);
    const id = randomUUID();
    const heartbeatId = setInterval(() => {
      writeSseComment(res, 'ping');
    }, REALTIME_HEARTBEAT_MS);

    const handle: RealtimeStreamHandle = {
      id,
      kind: meta.kind,
      res,
      userId: meta.userId,
      role: meta.role,
      ip: meta.ip,
      heartbeatId,
    };
    this.streams.set(id, handle);
    this.logger.debug(
      `SSE connected (${meta.kind}) id=${id} active=${this.streams.size}`,
    );

    const detach = (): void => {
      this.detachStream(id);
    };
    res.on('close', detach);
    res.on('error', detach);
    return detach;
  }

  private detachStream(id: string): void {
    const handle = this.streams.get(id);
    if (!handle) {
      return;
    }
    clearInterval(handle.heartbeatId);
    this.streams.delete(id);
    this.logger.debug(
      `SSE disconnected (${handle.kind}) id=${id} active=${this.streams.size}`,
    );
  }

  private toFrame(event: RealtimeEvent): SseOutboundFrame {
    const id = String(this.nextEventId);
    this.nextEventId += REALTIME_EVENT_ID_STEP;
    return {
      id,
      event: event.type,
      data: JSON.stringify(event.data),
    };
  }

  private isPublicEvent(event: RealtimeEvent): event is PublicRealtimeEvent {
    return (
      event.type === REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE ||
      event.type === REALTIME_EVENT_NAMES.SESSION_CHANGED ||
      event.type === REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED
    );
  }
}
