import {
  WHATSAPP_CONNECTED_STATUS,
  WHATSAPP_SENT_STATUS,
} from './whatsapp.constants';

export type GatewayEnvelope = {
  success?: boolean;
  data?: unknown;
  error?: { code?: string; message?: string };
};

export type WhatsappAccountSummary = {
  id: string;
  status: string | null;
  phoneNumber: string | null;
};

export function readGatewayError(result: GatewayEnvelope): string {
  return (
    result.error?.message || result.error?.code || 'WhatsApp Gateway error'
  );
}

export function parseGatewayAccounts(data: unknown): WhatsappAccountSummary[] {
  if (Array.isArray(data)) {
    return data.flatMap(toAccountSummary);
  }
  if (!isRecord(data)) {
    return [];
  }
  const items = data.items ?? data.accounts;
  if (Array.isArray(items)) {
    return items.flatMap(toAccountSummary);
  }
  return toAccountSummary(data);
}

export function parseGatewaySession(data: unknown): {
  status: string | null;
  qrDataUrl: string | null;
  phoneNumber: string | null;
} {
  if (!isRecord(data)) {
    return { status: null, qrDataUrl: null, phoneNumber: null };
  }
  return {
    status:
      readOptionalString(data.status) ??
      (data.connected === true ? WHATSAPP_CONNECTED_STATUS : null),
    qrDataUrl:
      readOptionalString(data.qrDataUrl) ?? readOptionalString(data.qr),
    phoneNumber: readOptionalString(data.phoneNumber),
  };
}

export function isGatewayMessageSent(data: unknown): boolean {
  if (!isRecord(data)) {
    return false;
  }
  const status = readOptionalString(data.status);
  return status === null || status === WHATSAPP_SENT_STATUS;
}

function toAccountSummary(value: unknown): WhatsappAccountSummary[] {
  if (!isRecord(value)) {
    return [];
  }
  const id = readOptionalString(value.id);
  if (id === null) {
    return [];
  }
  return [
    {
      id,
      status: readOptionalString(value.status),
      phoneNumber: readOptionalString(value.phoneNumber),
    },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
