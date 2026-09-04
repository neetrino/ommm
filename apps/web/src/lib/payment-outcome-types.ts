export type PaymentOutcomeEhdmReceipt = {
  receiptId: string;
  seq: number;
  fiscal: string | null;
  qr: string | null;
  taxpayer: string | null;
  tin: string | null;
  time: number | null;
  total: number | null;
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
