import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EhdmApiClient } from './ehdm-api.client';
import { EhdmConfig } from './ehdm.config';
import { resolvePaymentEhdmItemName } from './ehdm-item-name';
import { skipReasonForEhdmPrint } from './ehdm-print.guards';
import {
  buildEhdmPrintBody,
  resolveEhdmItemCode,
} from './ehdm-print-body.builder';
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

type PrintAttemptOutcome = 'done' | 'retry' | 'abort';

@Injectable()
export class EhdmPrintService {
  private readonly logger = new Logger(EhdmPrintService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EhdmConfig,
    private readonly seqService: EhdmSeqService,
    private readonly apiClient: EhdmApiClient,
  ) {}

  async printReceiptForPayment(paymentId: string): Promise<void> {
    if (!this.config.isFullyConfigured()) {
      this.logger.warn('EHDM is enabled but not configured; skipping print');
      return;
    }

    for (let attempt = 1; attempt <= EHDM_RECEIPT_MAX_ATTEMPTS; attempt++) {
      const outcome = await this.attemptPrint(paymentId, attempt);
      if (outcome !== 'retry') {
        return;
      }
      await sleep(EHDM_RECEIPT_RETRY_DELAY_MS);
    }
  }

  private async attemptPrint(
    paymentId: string,
    attempt: number,
  ): Promise<PrintAttemptOutcome> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { ehdmReceipt: true },
    });
    if (!payment) {
      return 'done';
    }
    const skipReason = skipReasonForEhdmPrint(payment);
    if (skipReason) {
      return 'done';
    }

    const seq = await this.seqService.reserveNextSeq();
    const itemName = await resolvePaymentEhdmItemName(this.prisma, payment);
    const body = buildEhdmPrintBody(this.config, {
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      amountCents: payment.amountCents,
      paymentMethod: payment.paymentMethod,
      itemName,
      itemCode: resolveEhdmItemCode(payment.paymentReference, payment.id),
      seq,
    });

    return this.sendPrint(payment.id, seq, body, attempt);
  }

  private async sendPrint(
    paymentId: string,
    seq: number,
    body: ReturnType<typeof buildEhdmPrintBody>,
    attempt: number,
  ): Promise<PrintAttemptOutcome> {
    try {
      const response = await this.apiClient.print(body);
      if (!isEhdmPrintSuccess(response)) {
        await this.seqService.rollbackSeq(seq);
        this.logger.error(
          `EHDM print rejected (attempt ${attempt}/${EHDM_RECEIPT_MAX_ATTEMPTS}) for ${paymentId}: ${ehdmRejectMessage(response)}`,
        );
        return attempt < EHDM_RECEIPT_MAX_ATTEMPTS ? 'retry' : 'abort';
      }
      await this.persistSaleReceipt(paymentId, seq, response);
      return 'done';
    } catch (error) {
      this.logger.error(
        `EHDM print transport failed for payment ${paymentId}; seq ${seq} left consumed`,
        error instanceof Error ? error.stack : String(error),
      );
      return 'abort';
    }
  }

  private async persistSaleReceipt(
    paymentId: string,
    seq: number,
    response: EhdmApiResponse,
  ): Promise<void> {
    const result = parseEhdmPrintResult(response);
    await this.prisma.ehdmReceipt.create({
      data: {
        paymentId,
        receiptId: toEhdmReceiptIdString(result.receiptId),
        seq,
        fiscal: result.fiscal ?? null,
        qr: result.qr ?? null,
        response: response,
      },
    });
  }
}
