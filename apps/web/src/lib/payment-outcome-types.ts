export type PaymentOutcomeEhdmReceipt = {
  receiptId: string;
  seq: number;
  fiscal: string | null;
  qr: string | null;
  isMock: boolean;
  createdAt: string;
};

export type PaymentOutcomePayload = {
  paymentReference: string | null;
  status: string;
  amountCents: number;
  currency: string;
  description: string | null;
  paymentMethod: string | null;
  paidAt: string;
  ehdmReceipt: PaymentOutcomeEhdmReceipt | null;
};
