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

export type EhdmReturnItem = {
  receiptProductId: number;
  quantity: number;
};

export type EhdmReturnRequestBody = {
  crn: string;
  seq: number;
  receiptId: number;
  cardAmountForReturn: number;
  cashAmountForReturn: number;
  returnItemList: EhdmReturnItem[];
};

export type EhdmPrintCopyRequestBody = {
  crn: string;
  seq: number;
  receiptId: number;
};

export type EhdmPrintResult = {
  receiptId: string | number;
  fiscal?: string;
  qr?: string;
  crn?: string;
  sn?: string;
  tin?: string;
  taxpayer?: string;
  address?: string;
  time?: number;
  total?: number;
};

export type EhdmApiResponse = {
  code: number;
  message?: string;
  error?: string;
  errorMessage?: string | null;
  result?: EhdmPrintResult | string | null;
};

export type EhdmReceiptSummary = {
  receiptId: string;
  seq: number;
  fiscal: string | null;
  qr: string | null;
  taxpayer: string | null;
  tin: string | null;
  time: number | null;
  total: number | null;
  createdAt: Date;
};
