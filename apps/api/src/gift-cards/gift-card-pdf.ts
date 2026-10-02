const PDF_HEADER = '%PDF-1.4\n';

export type GiftCardPdfInput = {
  code: string;
  amountLabel: string;
  message?: string;
};

/** One-page gift card. WinAnsi only: Armenian text is omitted, the code stays. */
export function buildGiftCardPdf(input: GiftCardPdfInput): Buffer {
  const lines = [
    'Ommm',
    'Gift card',
    input.amountLabel,
    `Code: ${input.code}`,
    input.message ? `Note: ${input.message}` : '',
    'Sign in or create an account, then enter this code.',
  ].filter((line) => line.length > 0);
  return buildPdf(lines.map(pdfText));
}

function pdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdf(lines: string[]): Buffer {
  const commands = ['BT', '/F1 16 Tf'];
  let y = 520;
  for (const line of lines) {
    commands.push(`1 0 0 1 48 ${y} Tm (${line}) Tj`);
    y -= 28;
  }
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
    '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 420 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n',
    `4 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj\n`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n',
  ];
  return Buffer.from(joinPdf(objects));
}

function joinPdf(objects: string[]): string {
  let pdf = PDF_HEADER;
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;
  return pdf;
}
