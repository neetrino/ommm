import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EHDM_STATE_ID } from './ehdm.constants';
import { EhdmConfig } from './ehdm.config';

@Injectable()
export class EhdmSeqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EhdmConfig,
  ) {}

  /** Atomically reserves the next seq for an EHDM API call. */
  async reserveNextSeq(
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<number> {
    const initialSeq = this.config.getInitialSeq();
    const existing = await tx.ehdmState.findUnique({
      where: { id: EHDM_STATE_ID },
    });
    const seq = existing?.nextSeq ?? initialSeq;
    await tx.ehdmState.upsert({
      where: { id: EHDM_STATE_ID },
      create: { id: EHDM_STATE_ID, nextSeq: seq + 1 },
      update: { nextSeq: seq + 1 },
    });
    return seq;
  }

  /** Rolls back a reserved seq when the API call fails before persisting a receipt. */
  async rollbackSeq(seq: number): Promise<void> {
    await this.prisma.ehdmState.updateMany({
      where: { id: EHDM_STATE_ID, nextSeq: seq + 1 },
      data: { nextSeq: seq },
    });
  }
}
