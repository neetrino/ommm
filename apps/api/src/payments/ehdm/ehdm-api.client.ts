import { Injectable, Logger } from '@nestjs/common';
import * as https from 'node:https';
import { EHDM_API_PATH } from './ehdm.constants';
import { EhdmConfig } from './ehdm.config';
import type {
  EhdmApiResponse,
  EhdmPrintCopyRequestBody,
  EhdmPrintRequestBody,
  EhdmReturnRequestBody,
} from './ehdm.types';

@Injectable()
export class EhdmApiClient {
  private readonly logger = new Logger(EhdmApiClient.name);

  constructor(private readonly config: EhdmConfig) {}

  async print(body: EhdmPrintRequestBody): Promise<EhdmApiResponse> {
    return this.post(EHDM_API_PATH.PRINT, body);
  }

  async printReturnReceipt(
    body: EhdmReturnRequestBody,
  ): Promise<EhdmApiResponse> {
    return this.post(EHDM_API_PATH.PRINT_RETURN, body);
  }

  async printCopy(body: EhdmPrintCopyRequestBody): Promise<EhdmApiResponse> {
    return this.post(EHDM_API_PATH.PRINT_COPY, body);
  }

  async checkConnection(crn: string): Promise<EhdmApiResponse> {
    return this.post(EHDM_API_PATH.CHECK_CONNECTION, { crn });
  }

  private async post(
    path: string,
    body: object,
  ): Promise<EhdmApiResponse> {
    const url = new URL(`${this.config.getApiUrl()}${path}`);
    const payload = JSON.stringify(body);
    const agent = this.createAgent();

    return new Promise((resolve, reject) => {
      const request = https.request(
        url,
        {
          method: 'POST',
          agent,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            language: 'hy',
          },
        },
        (response) => {
          this.collectJsonResponse(response, resolve, reject);
        },
      );

      request.on('error', (error) => {
        this.logger.error(`EHDM request failed for ${path}`, error.stack);
        reject(error);
      });
      request.write(payload);
      request.end();
    });
  }

  private collectJsonResponse(
    response: import('node:http').IncomingMessage,
    resolve: (value: EhdmApiResponse) => void,
    reject: (reason: Error) => void,
  ): void {
    const chunks: Buffer[] = [];
    response.on('data', (chunk: Buffer) => chunks.push(chunk));
    response.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(JSON.parse(raw) as EhdmApiResponse);
      } catch {
        reject(
          new Error(
            `EHDM invalid JSON (${response.statusCode ?? 'unknown'}): ${raw.slice(0, 200)}`,
          ),
        );
      }
    });
  }

  private createAgent(): https.Agent {
    return new https.Agent({
      cert: this.config.getCertPem(),
      key: this.config.getKeyPem(),
      passphrase: this.config.getKeyPassphrase(),
      rejectUnauthorized: true,
    });
  }
}
