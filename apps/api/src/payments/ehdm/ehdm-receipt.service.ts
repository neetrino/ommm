import { Injectable, Logger } from '@nestjs/common';
import { PaymentStatus, type Prisma } from '@prisma/client';
import { EhdmConfig } from './ehdm.config';
import { EhdmPrintService } from './ehdm-print.service';
import { readPrintResultFromJson } from './ehdm-receipt-result';
import { EhdmReturnService } from './ehdm-return.service';
import type { EhdmReceiptSummary } from './ehdm.types';

type ReceiptRow = {
  receiptId: string;
  seq: number;
  fiscal: string | null;
  qr: string | null;
  isMock: boolean;
  response: Prisma.JsonValue | null;
  createdAt: Date;
};

@Injectable()
export class EhdmReceiptService {
  private readonly logger = new Logger(EhdmReceiptService.name);

  constructor(
    private readonly config: EhdmConfig,
    private readonly printService: EhdmPrintService,
    private readonly returnService: EhdmReturnService,
  ) {}

  /** Fire-and-forget fiscal print when a payment newly reaches SUCCEEDED. */
  tryPrintReceipt(paymentId: string, previousStatus: PaymentStatus): void {
    if (
      !this.config.isEnabled() ||
      previousStatus === PaymentStatus.SUCCEEDED
    ) {
      return;
    }
    void this.printService.printReceiptForPayment(paymentId).catch((error) => {
      this.logger.error(
        `EHDM print failed for payment ${paymentId}`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }

  /** Fire-and-forget return receipt when a receipted payment is refunded. */
  tryPrintReturnReceipt(paymentId: string): void {
    if (!this.config.isEnabled()) {
      return;
    }
    void this.returnService.printReturnForPayment(paymentId).catch((error) => {
      this.logger.error(
        `EHDM return failed for payment ${paymentId}`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }

  toReceiptSummary(receipt: ReceiptRow): EhdmReceiptSummary | null {
    if (receipt.isMock) {
      return null;
    }
    const result = readPrintResultFromJson(receipt.response);
    return {
      receiptId: receipt.receiptId,
      seq: receipt.seq,
      fiscal: receipt.fiscal,
      qr: receipt.qr,
      taxpayer: result.taxpayer ?? null,
      tin: result.tin ?? null,
      time: result.time ?? null,
      total: result.total ?? null,
      createdAt: receipt.createdAt,
    };
  }
}
