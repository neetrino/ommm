import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { toArcaAmdAmount } from './arca-amount.util';

import { ArcaClient } from './arca.client';

import { ArcaConfig } from './arca.config';
import { mergeArcaMetadata, readArcaMetadata } from './arca-metadata.util';
import { ArcaPaymentSyncService } from './arca-payment-sync.service';
import {
  ARCA_PAYMENT_FAIL_PATH,
  ARCA_PAYMENT_SUCCESS_PATH,
} from './arca-result-paths';
import type { ArcaSyncOutcome, ArcaRegisterResponse } from './arca.types';

const SUPPORTED_ARCA_LOCALES = new Set(['hy', 'ru', 'en']);

@Injectable()
export class ArcaService {
  private readonly logger = new Logger(ArcaService.name);

  constructor(
    private readonly arcaClient: ArcaClient,

    private readonly arcaConfig: ArcaConfig,

    private readonly prisma: PrismaService,

    private readonly paymentSync: ArcaPaymentSyncService,
  ) {}

  async initPayment(params: {
    userId: string;

    paymentReference: string;

    locale?: string;
  }): Promise<{ redirectUrl: string }> {
    if (!this.arcaConfig.isConfigured()) {
      throw new BadRequestException('Arca payment is not configured');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { paymentReference: params.paymentReference },
    });

    if (!payment || payment.userId !== params.userId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    if (!this.isArcaCurrencySupported(payment.currency)) {
      throw new BadRequestException(
        'This payment currency is not supported by Arca',
      );
    }

    const locale = this.resolveLocale(params.locale);

    const checkoutSource = this.resolveCheckoutSource(payment.source);

    const metadata = readArcaMetadata(payment.metadata);

    const attempt = (metadata.arcaRegisterAttempt ?? 0) + 1;

    const orderNumber = attempt === 1 ? payment.id : `${payment.id}-${attempt}`;

    const returnUrl = `${this.arcaConfig.getAppUrl()}/api/v1/payments/arca/callback?reference=${encodeURIComponent(params.paymentReference)}`;

    const registerResponse = await this.arcaClient.registerOrder({
      orderNumber,

      amount: toArcaAmdAmount(payment.amountCents),

      returnUrl,

      description: payment.description ?? 'Ommm payment',

      language: locale,
    });

    this.assertRegisterSuccess(registerResponse);

    const arcaOrderId = registerResponse.orderId;

    const formUrl = registerResponse.formUrl;

    if (!arcaOrderId || !formUrl) {
      throw new BadRequestException('Arca did not return a payment form URL');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },

      data: {
        paymentMethod: ManualPaymentMethod.CARD,

        metadata: mergeArcaMetadata(payment.metadata, {
          provider: 'arca',

          arcaOrderId,

          checkoutLocale: locale,

          checkoutSource,

          arcaRegisterAttempt: attempt,
        }),
      },
    });

    return { redirectUrl: formUrl };
  }

  async handleCallback(params: {
    paymentReference: string;

    arcaOrderId?: string;
  }): Promise<{ redirectUrl: string }> {
    const payment = await this.prisma.payment.findFirst({
      where: { paymentReference: params.paymentReference },
    });

    if (!payment) {
      return { redirectUrl: this.buildResultUrl('failed', 'en', {}) };
    }

    const metadata = readArcaMetadata(payment.metadata);

    const locale = metadata.checkoutLocale ?? 'en';

    const source =
      metadata.checkoutSource ?? this.resolveCheckoutSource(payment.source);

    const resultParams = {
      reference: payment.paymentReference ?? undefined,

      source,
    };

    let outcome: ArcaSyncOutcome;
    try {
      outcome = await this.paymentSync.syncPayment(payment.id);
    } catch (error) {
      this.logger.error(
        `Arca callback failed for payment ${payment.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      outcome = 'error';
    }

    const result = outcome === 'deposited' ? 'success' : 'failed';

    return { redirectUrl: this.buildResultUrl(result, locale, resultParams) };
  }

  private isArcaCurrencySupported(currency: string): boolean {
    const normalized = currency.trim().toLowerCase();

    const code = this.arcaConfig.getCurrencyCode();

    if (code === '051') {
      return normalized === 'amd';
    }

    if (code === '840') {
      return normalized === 'usd';
    }

    if (code === '978') {
      return normalized === 'eur';
    }

    if (code === '643') {
      return normalized === 'rub';
    }

    return normalized === 'amd';
  }

  private resolveCheckoutSource(source: PaymentSource): string {
    switch (source) {
      case PaymentSource.GIFT:
        return 'gift';

      case PaymentSource.DROPIN:
        return 'dropin';

      case PaymentSource.PACKAGE:
        return 'package';

      default:
        return 'other';
    }
  }

  private assertRegisterSuccess(response: ArcaRegisterResponse): void {
    const errorCode = Number(response.errorCode ?? -1);

    if (errorCode === 0) {
      return;
    }

    throw new BadRequestException(
      response.errorMessage ??
        `Arca register failed (${String(response.errorCode)})`,
    );
  }

  private buildResultUrl(
    outcome: 'success' | 'failed',

    locale: string,

    params: { reference?: string | null; source?: string },
  ): string {
    const safeLocale = SUPPORTED_ARCA_LOCALES.has(locale) ? locale : 'en';
    const path =
      outcome === 'success'
        ? ARCA_PAYMENT_SUCCESS_PATH
        : ARCA_PAYMENT_FAIL_PATH;
    const base = `${this.arcaConfig.getAppUrl()}/${safeLocale}${path}`;

    const search = new URLSearchParams();

    if (params.reference) {
      search.set('reference', params.reference);
    }

    if (params.source) {
      search.set('source', params.source);
    }

    const query = search.toString();

    return query.length > 0 ? `${base}?${query}` : base;
  }

  private resolveLocale(locale?: string): string {
    const normalized = locale?.trim().toLowerCase();

    if (normalized && SUPPORTED_ARCA_LOCALES.has(normalized)) {
      return normalized;
    }

    return this.arcaConfig.getDefaultLanguage();
  }
}
