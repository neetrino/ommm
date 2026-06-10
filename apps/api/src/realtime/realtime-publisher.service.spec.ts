import { HttpException } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { REALTIME_EVENT_NAMES } from './realtime.types';
import { RealtimePublisherService } from './realtime-publisher.service';

type MockStream = {
  res: Response;
  chunks: string[];
  closeHandlers: Array<() => void>;
};

function createMockStream(): MockStream {
  const chunks: string[] = [];
  const closeHandlers: Array<() => void> = [];
  const res = {
    writableEnded: false,
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
    write: jest.fn((chunk: string) => {
      chunks.push(chunk);
      return true;
    }),
    on: jest.fn((event: string, handler: () => void) => {
      if (event === 'close' || event === 'error') {
        closeHandlers.push(handler);
      }
    }),
  } as unknown as Response;

  return { res, chunks, closeHandlers };
}

describe('RealtimePublisherService', () => {
  let service: RealtimePublisherService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new RealtimePublisherService();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('removes subscribers on stream close without leaking connections', () => {
    const streams = Array.from({ length: 5 }, () => createMockStream());
    for (const stream of streams) {
      service.attachPublicStream(stream.res, '127.0.0.1');
    }
    expect(service.activeConnectionCount).toBe(5);

    for (const stream of streams) {
      for (const handler of stream.closeHandlers) {
        handler();
      }
    }
    expect(service.activeConnectionCount).toBe(0);
  });

  it('caps concurrent public connections per IP', () => {
    for (let i = 0; i < 5; i += 1) {
      const stream = createMockStream();
      service.attachPublicStream(stream.res, '10.0.0.1');
    }
    const overflow = createMockStream();
    expect(() => service.attachPublicStream(overflow.res, '10.0.0.1')).toThrow(
      HttpException,
    );
  });

  it('emits public schedule invalidation without userId on public streams', () => {
    const publicStream = createMockStream();
    service.attachPublicStream(publicStream.res, '127.0.0.1');

    service.emitPublicScheduleSession('session-abc');

    const payload = publicStream.chunks.join('');
    expect(payload).toContain(
      `event: ${REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE}`,
    );
    expect(payload).toContain(`event: ${REALTIME_EVENT_NAMES.SESSION_CHANGED}`);
    expect(payload).toContain('"sessionId":"session-abc"');
    expect(payload).not.toContain('userId');
  });

  it('routes booking.changed only to the matching authenticated subscriber', () => {
    const publicStream = createMockStream();
    const userA = createMockStream();
    const userB = createMockStream();

    service.attachPublicStream(publicStream.res, '1.1.1.1');
    service.attachAuthenticatedStream(
      userA.res,
      { id: 'user-a', role: Role.USER },
      '1.1.1.1',
    );
    service.attachAuthenticatedStream(
      userB.res,
      { id: 'user-b', role: Role.USER },
      '1.1.1.1',
    );

    service.emitBookingSessionChange({
      userId: 'user-a',
      sessionId: 'session-1',
    });

    const userAPayload = userA.chunks.join('');
    const userBPayload = userB.chunks.join('');
    const publicPayload = publicStream.chunks.join('');

    expect(userAPayload).toContain(
      `event: ${REALTIME_EVENT_NAMES.BOOKING_CHANGED}`,
    );
    expect(userAPayload).toContain('"userId":"user-a"');
    expect(userBPayload).not.toContain(REALTIME_EVENT_NAMES.BOOKING_CHANGED);
    expect(publicPayload).not.toContain(REALTIME_EVENT_NAMES.BOOKING_CHANGED);
    expect(publicPayload).not.toContain('userId');
  });

  it('emits waitlist.offer only to the targeted user stream', () => {
    const offered = createMockStream();
    const other = createMockStream();
    service.attachAuthenticatedStream(
      offered.res,
      { id: 'offer-user', role: Role.USER },
      '9.9.9.9',
    );
    service.attachAuthenticatedStream(
      other.res,
      { id: 'other-user', role: Role.USER },
      '9.9.9.9',
    );

    service.emitWaitlistOffer('offer-user', 'session-offer');

    expect(offered.chunks.join('')).toContain(
      REALTIME_EVENT_NAMES.WAITLIST_OFFER,
    );
    expect(other.chunks.join('')).not.toContain(
      REALTIME_EVENT_NAMES.WAITLIST_OFFER,
    );
  });
});
