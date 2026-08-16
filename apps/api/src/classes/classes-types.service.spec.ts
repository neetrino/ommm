import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassesTypesService } from './classes-types.service';

describe('ClassesTypesService archive catalog delete', () => {
  const prisma = {
    classType: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const service = new ClassesTypesService(prisma as never);

  const activeType = {
    id: 'ct-1',
    name: 'Evening Yoga by Ommm',
    slug: 'evening-yoga-by-ommm',
    archivedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.classType.findUnique.mockResolvedValue(activeType);
  });

  it('archives the row instead of deleting when balances or sessions exist', async () => {
    prisma.classType.update.mockResolvedValue({
      ...activeType,
      archivedAt: new Date('2026-08-16T09:00:00.000Z'),
    });

    await expect(service.deleteType('ct-1')).resolves.toBeUndefined();

    expect(prisma.classType.delete).not.toHaveBeenCalled();
    expect(prisma.classType.update).toHaveBeenCalledTimes(1);
    const updateArgs = prisma.classType.update.mock.calls[0] as
      | [{ where: { id: string }; data: { archivedAt: Date } }]
      | undefined;
    expect(updateArgs?.[0].where).toEqual({ id: 'ct-1' });
    expect(updateArgs?.[0].data.archivedAt).toBeInstanceOf(Date);
  });

  it('is idempotent when the type is already archived', async () => {
    prisma.classType.findUnique.mockResolvedValue({
      ...activeType,
      archivedAt: new Date('2026-08-16T08:00:00.000Z'),
    });

    await expect(service.deleteType('ct-1')).resolves.toBeUndefined();
    expect(prisma.classType.update).not.toHaveBeenCalled();
    expect(prisma.classType.delete).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the type does not exist', async () => {
    prisma.classType.findUnique.mockResolvedValue(null);
    await expect(service.deleteType('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists only non-archived types for the admin catalog', async () => {
    prisma.classType.findMany.mockResolvedValue([activeType]);
    await service.listTypes();
    expect(prisma.classType.findMany).toHaveBeenCalledWith({
      where: { archivedAt: null },
      orderBy: { name: 'asc' },
    });
  });

  it('assertClassTypeExists still accepts archived types so bookings keep the id', async () => {
    prisma.classType.findUnique.mockResolvedValue({ id: 'ct-1' });
    await expect(
      service.assertClassTypeExists('ct-1'),
    ).resolves.toBeUndefined();
  });

  it('assertClassTypeAssignable rejects archived types for new sessions', async () => {
    prisma.classType.findFirst.mockResolvedValue(null);
    await expect(
      service.assertClassTypeAssignable('ct-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.classType.findFirst).toHaveBeenCalledWith({
      where: { id: 'ct-1', archivedAt: null },
      select: { id: true },
    });
  });

  it('assertClassTypeAssignable allows active types', async () => {
    prisma.classType.findFirst.mockResolvedValue({ id: 'ct-1' });
    await expect(
      service.assertClassTypeAssignable('ct-1'),
    ).resolves.toBeUndefined();
  });

  it('rejects edits to an archived class type', async () => {
    prisma.classType.findUnique.mockResolvedValue({
      ...activeType,
      archivedAt: new Date('2026-08-16T08:00:00.000Z'),
    });
    await expect(
      service.updateType('ct-1', { name: 'Renamed' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.classType.update).not.toHaveBeenCalled();
  });
});
