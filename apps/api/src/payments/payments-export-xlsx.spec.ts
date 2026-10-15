import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import {
  buildPaymentsXlsx,
  paymentsExportFilename,
  type PaymentsExportRow,
} from './payments-export-xlsx';

const HEADER_ROW = 4;

function payment(
  overrides: Partial<PaymentsExportRow> = {},
): PaymentsExportRow {
  return {
    id: 'pay-1',
    createdAt: new Date('2026-10-08T06:30:00.000Z'),
    amountCents: 45_000,
    status: PaymentStatus.SUCCEEDED,
    paymentMethod: ManualPaymentMethod.CASH,
    source: 'package',
    description: 'Package purchase',
    paymentReference: 'PKG-ABC123',
    relatedItemName: '8 sessions',
    relatedItemGroupName: 'Reformer',
    user: {
      email: 'anna@test.com',
      name: 'Anna',
      lastName: 'Petrosyan',
      phone: '+37499000000',
    },
    ...overrides,
  };
}

describe('payments workbook', () => {
  it('writes localized headers, studio dates, and numeric AMD amounts', async () => {
    const buffer = await buildPaymentsXlsx({
      locale: 'hy',
      from: '2026-10-01',
      to: '2026-10-31',
      items: [payment(), payment({ id: 'pay-2', amountCents: 5_000 })],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as never);
    const sheet = workbook.getWorksheet('Payments');
    expect(sheet?.getCell('A1').value).toBe('Վճարումներ');
    expect(sheet?.getCell('A2').value).toBe(
      '01/10/2026 – 31/10/2026 · 2 վճարում · Ընդամենը: 50,000 AMD',
    );
    expect(sheet?.getCell(`A${HEADER_ROW}`).value).toBe('Ամսաթիվ');
    const first = HEADER_ROW + 1;
    expect(sheet?.getCell(`A${first}`).value).toBe('08/10/2026');
    expect(sheet?.getCell(`C${first}`).value).toBe('Anna Petrosyan');
    expect(sheet?.getCell(`F${first}`).value).toBe(45_000);
    expect(sheet?.getCell(`G${first}`).value).toBe('Հաջողված');
    expect(sheet?.getCell(`H${first}`).value).toBe('Կանխիկ');
    expect(sheet?.getCell(`J${first}`).value).toBe('Reformer · 8 sessions');
    expect(sheet?.getCell(`L${first}`).value).toBe('PKG-ABC123');
  });

  it('names the file after the filtered period', () => {
    expect(paymentsExportFilename('2026-10-01', '2026-10-31')).toBe(
      'payments-2026-10-01_2026-10-31.xlsx',
    );
    expect(paymentsExportFilename()).toBe('payments-all.xlsx');
  });
});
