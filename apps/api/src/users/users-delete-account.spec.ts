import { BadRequestException } from '@nestjs/common';
import { BookingStatus, Prisma, Role } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService.deleteOwnAccount', () => {
  const homeImage = {} as never;

  function makeService(prismaMock: object): UsersService {
    return new UsersService(prismaMock as never, homeImage);
  }

  it('deletes the user row when role is USER and there are no active bookings', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ role: Role.USER }),
        delete: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      booking: {
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = makeService(prisma);

    await service.deleteOwnAccount('user-1');

    expect(prisma.booking.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: BookingStatus.BOOKED },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
  });

  it('rejects coach self-deletion', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ role: Role.COACH }),
        delete: jest.fn(),
      },
      booking: { count: jest.fn() },
    };
    const service = makeService(prisma);

    await expect(service.deleteOwnAccount('coach-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('rejects deletion when active bookings exist', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ role: Role.USER }),
        delete: jest.fn(),
      },
      booking: { count: jest.fn().mockResolvedValue(2) },
    };
    const service = makeService(prisma);

    await expect(service.deleteOwnAccount('user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('maps linked-record FK failures to a support message', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ role: Role.USER }),
        delete: jest.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('FK', {
            code: 'P2003',
            clientVersion: 'test',
          }),
        ),
      },
      booking: { count: jest.fn().mockResolvedValue(0) },
    };
    const service = makeService(prisma);

    await expect(service.deleteOwnAccount('user-1')).rejects.toMatchObject({
      response: {
        message:
          'This account has linked records and cannot be deleted. Contact support.',
      },
    });
  });
});
