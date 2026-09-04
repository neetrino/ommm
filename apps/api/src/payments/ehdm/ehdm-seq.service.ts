import { Injectable } from '@nestjs/common';
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
  async reserveNextSeq(): Promise<number> {
    const initialSeq = this.config.getInitialSeq();
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "EhdmState" ("id", "nextSeq")
        VALUES (${EHDM_STATE_ID}, ${initialSeq})
        ON CONFLICT ("id") DO NOTHING
      `;
      const rows = await tx.$queryRaw<Array<{ nextSeq: number }>>`
        SELECT "nextSeq" FROM "EhdmState"
        WHERE "id" = ${EHDM_STATE_ID}
        FOR UPDATE
      `;
      const seq = rows[0]?.nextSeq ?? initialSeq;
      await tx.ehdmState.update({
        where: { id: EHDM_STATE_ID },
        data: { nextSeq: seq + 1 },
      });
      return seq;
    });
  }

  /** Rolls back a reserved seq only when PEC did not accept it. */
  async rollbackSeq(seq: number): Promise<void> {
    await this.prisma.ehdmState.updateMany({
      where: { id: EHDM_STATE_ID, nextSeq: seq + 1 },
      data: { nextSeq: seq },
    });
  }
}
