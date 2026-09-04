import type { Prisma } from '@prisma/client';
import type { EhdmApiResponse, EhdmPrintResult } from './ehdm.types';

export function parseEhdmPrintResult(response: EhdmApiResponse): EhdmPrintResult {
  const result = response.result;
  if (result === undefined || result === null || typeof result === 'string') {
    throw new Error('EHDM print response did not include receipt data');
  }
  if (result.receiptId === undefined || result.receiptId === '') {
    throw new Error('EHDM print response missing receiptId');
  }
  return result;
}

export function toEhdmReceiptIdString(receiptId: string | number): string {
  return String(receiptId);
}

export function isEhdmPrintSuccess(response: EhdmApiResponse): boolean {
  return response.code === 0 && response.result != null;
}

export function ehdmRejectMessage(response: EhdmApiResponse): string {
  return (
    response.errorMessage ??
    response.error ??
    response.message ??
    `EHDM request failed with code ${response.code}`
  );
}

export function readPrintResultFromJson(
  response: Prisma.JsonValue | null,
): Partial<EhdmPrintResult> {
  if (!isRecord(response)) {
    return {};
  }
  const result = response.result;
  if (!isRecord(result)) {
    return {};
  }
  return {
    taxpayer: readOptionalString(result.taxpayer),
    tin: readOptionalString(result.tin),
    time: readOptionalNumber(result.time),
    total: readOptionalNumber(result.total),
    fiscal: readOptionalString(result.fiscal),
    qr: readOptionalString(result.qr),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
