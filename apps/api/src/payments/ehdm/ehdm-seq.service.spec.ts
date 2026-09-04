import { EhdmSeqService } from './ehdm-seq.service';

describe('EhdmSeqService', () => {
  it('creates the default row and returns the initial seq', async () => {
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      $queryRaw: jest.fn().mockResolvedValue([{ nextSeq: 200 }]),
      ehdmState: {
        update: jest.fn().mockResolvedValue({ id: 'default', nextSeq: 201 }),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<number>) =>
        fn(tx),
      ),
      ehdmState: { updateMany: jest.fn() },
    };
    const service = new EhdmSeqService(
      prisma as never,
      { getInitialSeq: () => 200 } as never,
    );

    await expect(service.reserveNextSeq()).resolves.toBe(200);
    expect(tx.ehdmState.update).toHaveBeenCalledWith({
      where: { id: 'default' },
      data: { nextSeq: 201 },
    });
  });

  it('rolls back only when nextSeq is still seq + 1', async () => {
    const prisma = {
      $transaction: jest.fn(),
      ehdmState: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const service = new EhdmSeqService(
      prisma as never,
      { getInitialSeq: () => 1 } as never,
    );

    await service.rollbackSeq(6);
    expect(prisma.ehdmState.updateMany).toHaveBeenCalledWith({
      where: { id: 'default', nextSeq: 7 },
      data: { nextSeq: 6 },
    });
  });
});
