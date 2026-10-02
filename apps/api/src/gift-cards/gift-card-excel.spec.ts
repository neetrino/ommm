import {
  buildGiftImportTemplate,
  buildIssuedCardsWorkbook,
  readGiftImportMatrix,
} from './gift-card-excel-file';
import { parseGiftImportMatrix } from './gift-card-excel-rows';

describe('gift card excel import', () => {
  it('reads money and class rows from a sheet', () => {
    const parsed = parseGiftImportMatrix([
      [
        'kind',
        'amountAmd',
        'className',
        'sessions',
        'quantity',
        'recipientEmail',
        'message',
        'expiresAt',
      ],
      ['money', 40_000, '', '', 2, '', 'hello', '2027-10-02'],
      ['class', '', 'Reformer Group', 4, 1, 'a@example.com', '', ''],
      ['', '', '', '', '', '', '', ''],
    ]);
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([
      {
        rowNumber: 2,
        kind: 'money',
        amountAmd: 40_000,
        className: null,
        sessions: null,
        quantity: 2,
        recipientEmail: null,
        message: 'hello',
        expiresAt: '2027-10-02',
      },
      {
        rowNumber: 3,
        kind: 'class',
        amountAmd: null,
        className: 'Reformer Group',
        sessions: 4,
        quantity: 1,
        recipientEmail: 'a@example.com',
        message: null,
        expiresAt: null,
      },
    ]);
  });

  it('rejects a sheet without a kind column', () => {
    const parsed = parseGiftImportMatrix([
      ['amountAmd', 'quantity'],
      [40_000, 1],
    ]);
    expect(parsed.rows).toEqual([]);
    expect(parsed.issues).toEqual([{ rowNumber: 1, code: 'missing_columns' }]);
  });

  it('round-trips the import template and an issued-card workbook', async () => {
    const template = await readGiftImportMatrix(
      await buildGiftImportTemplate(),
    );
    const parsed = parseGiftImportMatrix(template);
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows.map((row) => row.kind)).toEqual(['money', 'class']);

    const exported = await readGiftImportMatrix(
      await buildIssuedCardsWorkbook([
        {
          code: 'AB12CD34',
          status: 'ACTIVE',
          balanceAmd: 0,
          balanceClasses: 4,
          recipientEmail: null,
          redeemedAt: null,
          expiresAt: null,
        },
      ]),
    );
    expect(exported[1]?.[0]).toBe('AB12CD34');
  });
});
