import { buildGiftCardPdf } from './gift-card-pdf';

describe('buildGiftCardPdf', () => {
  it('returns a PDF that contains the gift code', () => {
    const pdf = buildGiftCardPdf({
      code: 'ABCD1234',
      amountLabel: '40000 AMD',
      message: 'Շնորհավոր',
    });
    const text = pdf.toString('latin1');
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('ABCD1234');
    expect(text).toContain('%%EOF');
  });
});
