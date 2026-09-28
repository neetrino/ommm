import { ClassSessionStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import {
  COACH_SALARY_XLSX_FIRST_DATA_ROW,
  COACH_SALARY_XLSX_HEADER_ROW,
  COACH_SALARY_XLSX_SHEET_NAME,
} from './coaches-salary-export.constants';
import { SALARY_XLSX_AMD_FORMAT } from './coaches-salary-sessions-xlsx-style';
import {
  coachSalaryExportContentDisposition,
  coachSalaryExportFilename,
  coachSalaryExportSessionCells,
} from './coaches-salary-export-rows';
import { buildCoachSalarySessionsXlsx } from './coaches-salary-sessions-xlsx';
import type { CoachSalarySessionRow } from './coaches-salary-sessions.helpers';

function session(
  overrides: Partial<CoachSalarySessionRow> = {},
): CoachSalarySessionRow {
  return {
    id: 'session-1',
    startsAt: new Date('2026-09-04T08:00:00.000Z'),
    endsAt: new Date('2026-09-04T09:00:00.000Z'),
    status: ClassSessionStatus.FINISHED,
    classType: { id: 'class-1', name: 'Reformer Group' },
    capacity: 6,
    registeredCount: 5,
    attendedCount: 5,
    noShowCount: 0,
    rateAmd: 20000,
    amountAmd: 20000,
    reason: 'PAID',
    ...overrides,
  };
}

describe('coach salary workbook', () => {
  it('writes only accrued salary amounts and a SUM total', async () => {
    const buffer = await buildCoachSalarySessionsXlsx({
      coachName: 'Armine Avoyan',
      from: '2026-09-01',
      to: '2026-09-26',
      locale: 'en',
      items: [
        session(),
        session({
          id: 'session-2',
          classType: { id: 'class-2', name: 'Mat Pilates Group' },
          reason: 'NO_BOOKINGS',
          amountAmd: 0,
          attendedCount: 0,
          registeredCount: 0,
          capacity: 10,
        }),
      ],
    });

    const workbook = new ExcelJS.Workbook();
    // exceljs typings still expect the pre-generic Node Buffer.
    await workbook.xlsx.load(buffer as never);
    const sheet = workbook.getWorksheet(COACH_SALARY_XLSX_SHEET_NAME);
    expect(sheet?.getCell('A1').value).toBe('Armine Avoyan');
    expect(sheet?.getCell('A1').font).toMatchObject({ bold: true, size: 18 });
    expect(sheet?.getCell('A2').value).toBe('01/09/2026 – 26/09/2026');
    expect(sheet?.getCell(`A${COACH_SALARY_XLSX_HEADER_ROW}`).value).toBe('Class');
    expect(sheet?.getCell(`A${COACH_SALARY_XLSX_HEADER_ROW}`).fill).toMatchObject({
      fgColor: { argb: 'FF5C6B57' },
    });
    expect(sheet?.getCell(`A${COACH_SALARY_XLSX_FIRST_DATA_ROW}`).value).toBe(
      'Reformer Group',
    );
    expect(sheet?.getCell(`B${COACH_SALARY_XLSX_FIRST_DATA_ROW}`).value).toBe(
      '04/09/2026',
    );
    expect(sheet?.getCell(`C${COACH_SALARY_XLSX_FIRST_DATA_ROW}`).value).toBe(
      '12:00',
    );
    expect(sheet?.getCell(`F${COACH_SALARY_XLSX_FIRST_DATA_ROW}`).value).toBe(
      20000,
    );
    expect(sheet?.getCell(`F${COACH_SALARY_XLSX_FIRST_DATA_ROW}`).numFmt).toBe(
      SALARY_XLSX_AMD_FORMAT,
    );
    expect(sheet?.getCell(`G${COACH_SALARY_XLSX_FIRST_DATA_ROW}`).fill).toMatchObject(
      { fgColor: { argb: 'FFD1FAE5' } },
    );
    expect(
      sheet?.getCell(`F${COACH_SALARY_XLSX_FIRST_DATA_ROW + 1}`).value,
    ).toBeNull();
    expect(sheet?.getCell(`G${COACH_SALARY_XLSX_FIRST_DATA_ROW + 1}`).value).toBe(
      'NOBODY BOOKED',
    );
    const totalsRow = COACH_SALARY_XLSX_FIRST_DATA_ROW + 2;
    const total = sheet?.getCell(`F${totalsRow}`).value;
    expect(total).toMatchObject({
      formula: `SUM(F${COACH_SALARY_XLSX_FIRST_DATA_ROW}:F${COACH_SALARY_XLSX_FIRST_DATA_ROW + 1})`,
    });
    expect(sheet?.views[0]).toMatchObject({
      state: 'frozen',
      showGridLines: false,
    });
  });

  it('keeps Armenian names in the download filename', () => {
    const filename = coachSalaryExportFilename(
      'Արմինե Ավոյան',
      '2026-09-01',
      '2026-09-26',
    );
    const header = coachSalaryExportContentDisposition(filename);
    expect(header).toContain("filename*=UTF-8''");
    expect(decodeURIComponent(header.split("filename*=UTF-8''")[1] ?? '')).toBe(
      filename,
    );
    expect(coachSalaryExportSessionCells(session()).at(6)).toBe('COMPLETED');
  });
});
