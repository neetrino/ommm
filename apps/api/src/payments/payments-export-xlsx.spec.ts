import 'reflect-metadata';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import { PaymentSourceFilter } from './dto/admin-list-payments-query.dto';
import { paymentsExportFilename } from './payments-export-filename';
import {
  buildPaymentsXlsx,
  type PaymentsExportRow,
} from './payments-export-xlsx';

const HEADER_ROW = 4;

function payment(
  overrides: Partial<PaymentsExportRow> = {},
): PaymentsExportRow {
  return {
    id: 'pay-1',
    createdAt: new Date('2026-10-08T06:30:00.000Z'),
    confirmedAt: new Date('2026-10-09T07:15:00.000Z'),
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
    expect(sheet?.getCell(`A${HEADER_ROW}`).value).toBe('Ստեղծման ամսաթիվ');
    expect(sheet?.getCell(`C${HEADER_ROW}`).value).toBe('Վճարման ամսաթիվ');
    const first = HEADER_ROW + 1;
    expect(sheet?.getCell(`A${first}`).value).toBe('08/10/2026');
    expect(sheet?.getCell(`C${first}`).value).toBe('09/10/2026');
    expect(sheet?.getCell(`D${first}`).value).toBe('11:15');
    expect(sheet?.getCell(`E${first}`).value).toBe('Anna Petrosyan');
    expect(sheet?.getCell(`H${first}`).value).toBe(45_000);
    expect(sheet?.getCell(`I${first}`).value).toBe('Հաջողված');
    expect(sheet?.getCell(`J${first}`).value).toBe('Կանխիկ');
    expect(sheet?.getCell(`L${first}`).value).toBe('Reformer · 8 sessions');
    expect(sheet?.getCell(`N${first}`).value).toBe('PKG-ABC123');
  });

  it('names the file after the period and every active filter', () => {
    expect(
      paymentsExportFilename({
        locale: 'hy',
        query: {
          from: '2026-10-01',
          to: '2026-10-31',
          status: [PaymentStatus.SUCCEEDED],
          paymentMethod: [ManualPaymentMethod.CASH],
          source: [PaymentSourceFilter.PACKAGE],
          sessions: ['8'],
          q: 'Anna P/',
        },
        planNames: ['Reformer 8'],
      }),
    ).toBe(
      'Վճարումներ_2026-10-01_2026-10-31_Հաջողված_Փաթեթ_Կանխիկ_Reformer-8_8-նիստ_Anna-P.xlsx',
    );
    expect(
      paymentsExportFilename({ locale: 'en', query: {}, planNames: [] }),
    ).toBe('Payments.xlsx');
  });
});
