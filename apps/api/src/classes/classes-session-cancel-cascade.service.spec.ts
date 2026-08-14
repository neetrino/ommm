import { ClassesSessionCancelCascadeService } from './classes-session-cancel-cascade.service';

describe('ClassesSessionCancelCascadeService', () => {
  it('releases bookings, expires waitlist, and notifies affected users', async () => {
    const slots = {
      releaseRegistrationsForAdminCancelledSession: jest
        .fn()
        .mockResolvedValue(['user-1', 'user-2']),
    };
    const waitlist = {
      expireForCancelledSession: jest.fn().mockResolvedValue(undefined),
    };
    const realtime = {
      emitBookingSessionChange: jest.fn(),
    };
    const service = new ClassesSessionCancelCascadeService(
      slots as never,
      waitlist as never,
      realtime as never,
    );

    await service.apply('session-1');

    expect(
      slots.releaseRegistrationsForAdminCancelledSession,
    ).toHaveBeenCalledWith('session-1');
    expect(waitlist.expireForCancelledSession).toHaveBeenCalledWith(
      'session-1',
    );
    expect(realtime.emitBookingSessionChange).toHaveBeenCalledTimes(2);
    expect(realtime.emitBookingSessionChange).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: 'session-1',
    });
  });

  it('still expires waitlist when no bookings need release', async () => {
    const slots = {
      releaseRegistrationsForAdminCancelledSession: jest
        .fn()
        .mockResolvedValue([]),
    };
    const waitlist = {
      expireForCancelledSession: jest.fn().mockResolvedValue(undefined),
    };
    const realtime = { emitBookingSessionChange: jest.fn() };
    const service = new ClassesSessionCancelCascadeService(
      slots as never,
      waitlist as never,
      realtime as never,
    );

    await service.apply('session-empty');

    expect(waitlist.expireForCancelledSession).toHaveBeenCalledWith(
      'session-empty',
    );
    expect(realtime.emitBookingSessionChange).not.toHaveBeenCalled();
  });
});
