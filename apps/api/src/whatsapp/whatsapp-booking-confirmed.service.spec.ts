import { BookingStatus } from '@prisma/client';
import { WhatsappBookingConfirmedService } from './whatsapp-booking-confirmed.service';

describe('WhatsappBookingConfirmedService', () => {
  function createService() {
    const prisma = {
      bookingConfirmedSendLog: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      booking: { findUnique: jest.fn() },
    };
    const notify = { trySendToUser: jest.fn().mockResolvedValue('sent') };
    return {
      service: new WhatsappBookingConfirmedService(
        prisma as never,
        notify as never,
      ),
      prisma,
      notify,
    };
  }

  it('sends again after the same booking is reactivated', async () => {
    const { service, prisma, notify } = createService();
    const bookedAt = new Date('2026-08-31T12:00:00.000Z');
    prisma.bookingConfirmedSendLog.findUnique.mockResolvedValue({
      sentAt: new Date('2026-08-30T12:00:00.000Z'),
    });
    prisma.booking.findUnique.mockResolvedValue({
      id: 'b1',
      status: BookingStatus.BOOKED,
      guestPassSlot: 0,
      updatedAt: bookedAt,
      user: { id: 'u1', locale: 'hy' },
      session: {
        startsAt: bookedAt,
        classType: { name: 'Reformer' },
      },
    });

    await service.tryNotify('b1');

    expect(notify.trySendToUser).toHaveBeenCalled();
    expect(prisma.bookingConfirmedSendLog.upsert).toHaveBeenCalled();
  });
});
