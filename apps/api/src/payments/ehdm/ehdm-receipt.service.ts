import { Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { detectPaymentSource, readPaymentSource } from '../payments.helpers';
import {
  resolveAdminPaymentRelatedItemName,
  type AdminPaymentPackageLabels,
} from '../payments-related-item.util';
import { EhdmApiClient } from './ehdm-api.client';
import { EhdmConfig } from './ehdm.config';
import { EhdmMockClient } from './ehdm-mock.client';
import {
  buildEhdmPrintBody,
  resolveEhdmItemCode,
  resolveEhdmItemName,
} from './ehdm-print-body.builder';
import { EhdmSeqService } from './ehdm-seq.service';
import type {
  EhdmApiResponse,
  EhdmPrintResult,
  EhdmReceiptSummary,
} from './ehdm.types';

@Injectable()
export class EhdmReceiptService {
  private readonly logger = new Logger(EhdmReceiptService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EhdmConfig,
    private readonly seqService: EhdmSeqService,
    private readonly apiClient: EhdmApiClient,
    private readonly mockClient: EhdmMockClient,
  ) {}

  /** Fire-and-forget fiscal print when a payment newly reaches SUCCEEDED. */
  tryPrintReceipt(paymentId: string, previousStatus: PaymentStatus): void {
    if (!this.config.isEnabled()) {
      return;
    }
    if (previousStatus === PaymentStatus.SUCCEEDED) {
      return;
    }
    void this.printReceiptForPayment(paymentId).catch((error) => {
      this.logger.error(
        `EHDM print failed for payment ${paymentId}`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }

  toReceiptSummary(receipt: {
    receiptId: string;
    seq: number;
    fiscal: string | null;
    qr: string | null;
    isMock: boolean;
    createdAt: Date;
  }): EhdmReceiptSummary {
    return {
      receiptId: receipt.receiptId,
      seq: receipt.seq,
      fiscal: receipt.fiscal,
      qr: receipt.qr,
      isMock: receipt.isMock,
      createdAt: receipt.createdAt,
    };
  }

  private async printReceiptForPayment(paymentId: string): Promise<void> {
    if (!this.config.isLiveConfigured()) {
      this.logger.warn('EHDM is enabled but not configured; skipping print');
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { ehdmReceipt: true },
    });
    if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
      return;
    }
    if (payment.ehdmReceipt) {
      return;
    }
    if (payment.currency.toLowerCase() !== 'amd') {
      return;
    }

    const itemName = await this.resolveItemName(payment);
    const seq = await this.seqService.reserveNextSeq();
    const body = buildEhdmPrintBody(this.config, {
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      amountCents: payment.amountCents,
      paymentMethod: payment.paymentMethod,
      itemName,
      itemCode: resolveEhdmItemCode(payment.paymentReference, payment.id),
      seq,
    });

    try {
      const response = await this.callPrint(body);
      const result = parsePrintResult(response);
      await this.prisma.ehdmReceipt.create({
        data: {
          paymentId: payment.id,
          receiptId: result.receiptId,
          seq,
          fiscal: result.fiscal ?? null,
          qr: result.qr ?? null,
          isMock: this.config.isTestMode(),
          response: response,
        },
      });
    } catch (error) {
      await this.seqService.rollbackSeq(seq);
      throw error;
    }
  }

  private async callPrint(
    body: ReturnType<typeof buildEhdmPrintBody>,
  ): Promise<EhdmApiResponse> {
    if (this.config.isTestMode()) {
      return this.mockClient.print(body);
    }
    const response = await this.apiClient.print(body);
    if (response.code !== 0 || !response.result) {
      throw new Error(
        response.errorMessage ??
          response.message ??
          `EHDM print failed with code ${response.code}`,
      );
    }
    return response;
  }

  private async resolveItemName(payment: {
    description: string | null;
    sourceId: string | null;
    source: unknown;
  }): Promise<string> {
    const source = detectPaymentSource(
      payment.description,
      readPaymentSource(payment),
    );
    const packageLabels = await this.loadPackageLabels(payment, source);
    return resolveEhdmItemName(
      resolveAdminPaymentRelatedItemName({
        source,
        description: payment.description,
        sourceId: payment.sourceId,
        packageLabelsByUserPackageId: packageLabels,
      }),
      payment.description,
    );
  }

  private async loadPackageLabels(
    payment: { sourceId: string | null },
    source: ReturnType<typeof detectPaymentSource>,
  ): Promise<Map<string, AdminPaymentPackageLabels>> {
    if (source !== 'package' || payment.sourceId === null) {
      return new Map();
    }
    const userPackage = await this.prisma.userPackage.findUnique({
      where: { id: payment.sourceId },
      select: {
        id: true,
        planNameSnapshot: true,
        planCategoryNameSnapshot: true,
        plan: { select: { name: true, categoryName: true } },
      },
    });
    if (!userPackage) {
      return new Map();
    }
    const groupName = (
      userPackage.plan?.categoryName ?? userPackage.planCategoryNameSnapshot
    ).trim();
    return new Map([
      [
        userPackage.id,
        {
          name: userPackage.plan?.name ?? userPackage.planNameSnapshot,
          groupName: groupName.length > 0 ? groupName : null,
        },
      ],
    ]);
  }
}

function parsePrintResult(response: EhdmApiResponse): EhdmPrintResult {
  const result = response.result;
  if (result === undefined || result === null || typeof result === 'string') {
    throw new Error('EHDM print response did not include receipt data');
  }
  if (!result.receiptId) {
    throw new Error('EHDM print response missing receiptId');
  }
  return result;
}
