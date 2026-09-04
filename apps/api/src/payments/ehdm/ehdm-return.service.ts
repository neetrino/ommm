import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EhdmApiClient } from './ehdm-api.client';
import { EhdmConfig } from './ehdm.config';
import { skipReasonForEhdmReturn } from './ehdm-print.guards';
import { buildEhdmReturnBody } from './ehdm-return-body.builder';
import {
  ehdmRejectMessage,
  isEhdmPrintSuccess,
  parseEhdmPrintResult,
  toEhdmReceiptIdString,
} from './ehdm-receipt-result';
import { sleep } from './ehdm-retry';
import { EhdmSeqService } from './ehdm-seq.service';
import {
  EHDM_RECEIPT_MAX_ATTEMPTS,
  EHDM_RECEIPT_RETRY_DELAY_MS,
} from './ehdm.constants';
import type { EhdmApiResponse } from './ehdm.types';

type ReturnAttemptOutcome = 'done' | 'retry' | 'abort';

@Injectable()
export class EhdmReturnService {
  private readonly logger = new Logger(EhdmReturnService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EhdmConfig,
    private readonly seqService: EhdmSeqService,
    private readonly apiClient: EhdmApiClient,
  ) {}

  async printReturnForPayment(paymentId: string): Promise<void> {
    if (!this.config.isFullyConfigured()) {
      this.logger.warn('EHDM is enabled but not configured; skipping return');
      return;
    }

    for (let attempt = 1; attempt <= EHDM_RECEIPT_MAX_ATTEMPTS; attempt++) {
      const outcome = await this.attemptReturn(paymentId, attempt);
      if (outcome !== 'retry') {
        return;
      }
      await sleep(EHDM_RECEIPT_RETRY_DELAY_MS);
    }
  }

  private async attemptReturn(
    paymentId: string,
    attempt: number,
  ): Promise<ReturnAttemptOutcome> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { ehdmReceipt: true },
    });
    if (!payment) {
      return 'done';
    }
    const skipReason = skipReasonForEhdmReturn(payment);
    if (skipReason) {
      if (skipReason === 'sale receipt is missing') {
        this.logger.warn(
          `EHDM return skipped for payment ${paymentId}: ${skipReason}`,
        );
      }
      return 'done';
    }

    const sale = payment.ehdmReceipt;
    if (!sale) {
      return 'done';
    }

    const seq = await this.seqService.reserveNextSeq();
    const body = buildEhdmReturnBody(this.config, {
      receiptId: sale.receiptId,
      amountCents: payment.amountCents,
      paymentMethod: payment.paymentMethod,
      seq,
    });
    return this.sendReturn(sale.id, seq, body, attempt, paymentId);
  }

  private async sendReturn(
    saleReceiptRowId: string,
    seq: number,
    body: ReturnType<typeof buildEhdmReturnBody>,
    attempt: number,
    paymentId: string,
  ): Promise<ReturnAttemptOutcome> {
    try {
      const response = await this.apiClient.printReturnReceipt(body);
      if (!isEhdmPrintSuccess(response)) {
        await this.seqService.rollbackSeq(seq);
        this.logger.error(
          `EHDM return rejected (attempt ${attempt}/${EHDM_RECEIPT_MAX_ATTEMPTS}) for ${paymentId}: ${ehdmRejectMessage(response)}`,
        );
        return attempt < EHDM_RECEIPT_MAX_ATTEMPTS ? 'retry' : 'abort';
      }
      await this.persistReturnReceipt(saleReceiptRowId, seq, response);
      return 'done';
    } catch (error) {
      this.logger.error(
        `EHDM return transport failed for payment ${paymentId}; seq ${seq} left consumed`,
        error instanceof Error ? error.stack : String(error),
      );
      return 'abort';
    }
  }

  private async persistReturnReceipt(
    saleReceiptRowId: string,
    seq: number,
    response: EhdmApiResponse,
  ): Promise<void> {
    const result = parseEhdmPrintResult(response);
    await this.prisma.ehdmReceipt.update({
      where: { id: saleReceiptRowId },
      data: {
        returnReceiptId: toEhdmReceiptIdString(result.receiptId),
        returnSeq: seq,
        returnResponse: response as Prisma.InputJsonValue,
        returnedAt: new Date(),
      },
    });
  }
}
