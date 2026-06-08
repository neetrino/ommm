import {

  BadRequestException,

  Injectable,

  Logger,

  NotFoundException,

} from '@nestjs/common';

import { ManualPaymentMethod, PaymentSource, PaymentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { PaymentsService } from '../payments.service';

import { toArcaAmdAmount } from './arca-amount.util';

import { ArcaClient } from './arca.client';

import { ArcaConfig } from './arca.config';
import {
  ARCA_PAYMENT_FAIL_PATH,
  ARCA_PAYMENT_SUCCESS_PATH,
} from './arca-result-paths';
import {
  ARCA_PAYMENT_STATE,
  type ArcaPaymentMetadata,
  type ArcaRegisterResponse,
} from './arca.types';



const SUPPORTED_ARCA_LOCALES = new Set(['hy', 'ru', 'en']);



@Injectable()

export class ArcaService {

  private readonly logger = new Logger(ArcaService.name);



  constructor(

    private readonly arcaClient: ArcaClient,

    private readonly arcaConfig: ArcaConfig,

    private readonly prisma: PrismaService,

    private readonly payments: PaymentsService,

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

      throw new BadRequestException('This payment currency is not supported by Arca');

    }



    const locale = this.resolveLocale(params.locale);

    const checkoutSource = this.resolveCheckoutSource(payment.source);

    const metadata = this.readArcaMetadata(payment.metadata);

    const attempt = (metadata.arcaRegisterAttempt ?? 0) + 1;

    const orderNumber =

      attempt === 1 ? payment.id : `${payment.id}-${attempt}`;



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

        metadata: this.mergeMetadata(payment.metadata, {

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



    const metadata = this.readArcaMetadata(payment.metadata);

    const locale = metadata.checkoutLocale ?? 'en';

    const source =

      metadata.checkoutSource ?? this.resolveCheckoutSource(payment.source);

    const resultParams = {

      reference: payment.paymentReference ?? undefined,

      source,

    };

    const orderId = params.arcaOrderId ?? metadata.arcaOrderId;



    if (!orderId) {

      await this.markFailed(payment.id);

      return { redirectUrl: this.buildResultUrl('failed', locale, resultParams) };

    }



    if (payment.status === PaymentStatus.SUCCEEDED) {

      return { redirectUrl: this.buildResultUrl('success', locale, resultParams) };

    }



    const statusResponse = await this.arcaClient.getOrderStatusExtended(orderId);

    const errorCode = Number(statusResponse.errorCode ?? -1);

    if (errorCode !== 0) {

      this.logger.warn(

        `Arca status error for ${payment.id}: ${statusResponse.errorMessage ?? errorCode}`,

      );

      await this.markFailed(payment.id, orderId);

      return { redirectUrl: this.buildResultUrl('failed', locale, resultParams) };

    }



    const paymentState = statusResponse.paymentAmountInfo?.paymentState;

    const isDeposited =

      paymentState === ARCA_PAYMENT_STATE.DEPOSITED ||

      statusResponse.orderStatus === 2;



    if (isDeposited) {

      await this.payments.confirmPendingCardPayment(payment.id);

      return { redirectUrl: this.buildResultUrl('success', locale, resultParams) };

    }



    await this.markFailed(payment.id, orderId);

    return { redirectUrl: this.buildResultUrl('failed', locale, resultParams) };

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

      response.errorMessage ?? `Arca register failed (${String(response.errorCode)})`,

    );

  }



  private async markFailed(paymentId: string, arcaOrderId?: string): Promise<void> {

    const existing = await this.prisma.payment.findUnique({

      where: { id: paymentId },

      select: { metadata: true, status: true },

    });

    if (!existing || existing.status !== PaymentStatus.PENDING) {

      return;

    }



    await this.prisma.payment.update({

      where: { id: paymentId },

      data: {

        status: PaymentStatus.FAILED,

        confirmedAt: new Date(),

        paymentMethod: ManualPaymentMethod.CARD,

        ...(arcaOrderId

          ? {

              metadata: this.mergeMetadata(existing.metadata, {

                provider: 'arca',

                arcaOrderId,

              }),

            }

          : {}),

      },

    });

  }



  private buildResultUrl(

    outcome: 'success' | 'failed',

    locale: string,

    params: { reference?: string | null; source?: string },

  ): string {

    const safeLocale = SUPPORTED_ARCA_LOCALES.has(locale) ? locale : 'en';
    const path =
      outcome === 'success' ? ARCA_PAYMENT_SUCCESS_PATH : ARCA_PAYMENT_FAIL_PATH;
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



  private readArcaMetadata(metadata: Prisma.JsonValue | null): ArcaPaymentMetadata {

    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {

      return {};

    }

    const record = metadata as Record<string, unknown>;

    return {

      provider: record.provider === 'arca' ? 'arca' : undefined,

      arcaOrderId:

        typeof record.arcaOrderId === 'string' ? record.arcaOrderId : undefined,

      checkoutLocale:

        typeof record.checkoutLocale === 'string'

          ? record.checkoutLocale

          : undefined,

      checkoutSource:

        typeof record.checkoutSource === 'string'

          ? record.checkoutSource

          : undefined,

      arcaRegisterAttempt:

        typeof record.arcaRegisterAttempt === 'number'

          ? record.arcaRegisterAttempt

          : undefined,

    };

  }



  private mergeMetadata(

    existing: Prisma.JsonValue | null,

    patch: ArcaPaymentMetadata,

  ): Prisma.InputJsonValue {

    const base =

      existing !== null &&

      typeof existing === 'object' &&

      !Array.isArray(existing)

        ? { ...(existing as Record<string, unknown>) }

        : {};

    return { ...base, ...patch };

  }

}


