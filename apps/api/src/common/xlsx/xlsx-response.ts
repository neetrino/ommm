import type { Response } from 'express';

export const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Streams a workbook as a download with an ASCII-safe and UTF-8 file name. */
export function sendXlsxAttachment(
  res: Response,
  filename: string,
  buffer: Buffer,
): void {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  const encoded = encodeURIComponent(filename);
  res.setHeader('Content-Type', XLSX_CONTENT_TYPE);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`,
  );
  res.send(buffer);
}
