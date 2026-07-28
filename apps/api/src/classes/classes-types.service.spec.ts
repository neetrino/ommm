import { BadRequestException } from '@nestjs/common';
import { ClassesTypesService } from './classes-types.service';

describe('ClassesTypesService.deleteType', () => {
  const prisma = {
    classType: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    classSession: { count: jest.fn() },
    booking: { count: jest.fn() },
    waitlistEntry: { count: jest.fn() },
    userPackageBalance: { count: jest.fn() },
    packagePlan: { findMany: jest.fn() },
  };

  const service = new ClassesTypesService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.classType.findUnique.mockResolvedValue({
      id: 'ct-1',
      name: 'Reformer Group',
      slug: 'reformer-group',
    });
    prisma.classSession.count.mockResolvedValue(0);
    prisma.booking.count.mockResolvedValue(0);
    prisma.waitlistEntry.count.mockResolvedValue(0);
    prisma.userPackageBalance.count.mockResolvedValue(0);
    prisma.packagePlan.findMany.mockResolvedValue([]);
  });

  it('blocks delete when bookings exist for the class type', async () => {
    prisma.booking.count.mockResolvedValue(2);
    await expect(service.deleteType('ct-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.classType.delete).not.toHaveBeenCalled();
  });

  it('blocks delete when package balances reference the class type', async () => {
    prisma.userPackageBalance.count.mockResolvedValue(3);
    await expect(service.deleteType('ct-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.classType.delete).not.toHaveBeenCalled();
  });

  it('blocks delete when a package plan allocation references the class type', async () => {
    prisma.packagePlan.findMany.mockResolvedValue([
      {
        id: 'plan-1',
        classTypeId: null,
        typeSessionAllocations: [
          { classTypeId: 'ct-1', sessionCount: 8 },
        ],
      },
    ]);
    await expect(service.deleteType('ct-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.classType.delete).not.toHaveBeenCalled();
  });

  it('deletes when no sessions, bookings, balances, or plan refs exist', async () => {
    prisma.classType.delete.mockResolvedValue(undefined);
    await expect(service.deleteType('ct-1')).resolves.toBeUndefined();
    expect(prisma.classType.delete).toHaveBeenCalledWith({
      where: { id: 'ct-1' },
    });
  });
});
