import { Injectable } from '@nestjs/common';
import { EhdmConfig } from './ehdm.config';
import type {
  EhdmApiResponse,
  EhdmPrintRequestBody,
  EhdmPrintResult,
} from './ehdm.types';

@Injectable()
export class EhdmMockClient {
  constructor(private readonly config: EhdmConfig) {}

  print(body: EhdmPrintRequestBody): EhdmApiResponse {
    const total =
      body.cardAmount +
      body.cashAmount +
      body.partialAmount +
      body.prePaymentAmount;
    const result: EhdmPrintResult = {
      receiptId: `MOCK-${body.seq}`,
      fiscal: `MOCK-FISCAL-${body.seq}`,
      qr: `https://mock.ehdm.local/receipt/${body.seq}`,
      crn: body.crn,
      sn: 'MOCK-SN',
      tin: this.config.getTin(),
      time: new Date().toISOString(),
      total,
    };
    return {
      code: 0,
      message: 'OK',
      errorMessage: null,
      result,
    };
  }
}
