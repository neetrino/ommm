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
  ehdmReceipt: PaymentOutcomeEhdmReceipt | null;
};
