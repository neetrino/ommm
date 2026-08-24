export type EhdmPrintItem = {
  dep: number;
  adgCode: string;
  goodCode: string;
  goodName: string;
  quantity: number;
  unit: string;
  price: number;
};

export type EhdmPrintRequestBody = {
  crn: string;
  seq: number;
  mode: number;
  cashierId: number;
  cardAmount: number;
  cashAmount: number;
  partialAmount: number;
  prePaymentAmount: number;
  partnerTin: string | null;
  items: EhdmPrintItem[];
};

export type EhdmPrintResult = {
  receiptId: string;
  fiscal?: string;
  qr?: string;
  crn?: string;
  sn?: string;
  tin?: string;
  time?: string;
  total?: number;
};

export type EhdmApiResponse = {
  code: number;
  message?: string;
  errorMessage?: string | null;
  result?: EhdmPrintResult | string | null;
};

export type EhdmReceiptSummary = {
  receiptId: string;
  seq: number;
  fiscal: string | null;
  qr: string | null;
  isMock: boolean;
  createdAt: Date;
};
