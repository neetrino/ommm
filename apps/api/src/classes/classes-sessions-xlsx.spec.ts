import { ClassSessionStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import { SCHEDULE_XLSX_HEADER_ROW } from './classes-sessions-export.constants';
import {
  scheduleExportFilename,
  scheduleExportSessionCells,
  type ScheduleExportSession,
} from './classes-sessions-export-rows';
import { buildScheduleSessionsXlsx } from './classes-sessions-xlsx';

function session(
  overrides: Partial<ScheduleExportSession> = {},
): ScheduleExportSession {
  return {
    title: 'Reformer Group',
    classTypeName: 'Reformer',
    coachName: 'Armine Avoyan',
    startsAt: new Date('2026-10-08T06:30:00.000Z'),
    endsAt: new Date('2026-10-08T07:20:00.000Z'),
    level: 'Beginner',
    capacity: 8,
    booked: 5,
    status: ClassSessionStatus.ACTIVE,
    ...overrides,
  };
}

describe('schedule workbook', () => {
  it('writes studio date, capacity, and localized headers', async () => {
    const buffer = await buildScheduleSessionsXlsx({
      locale: 'hy',
      from: '2026-10-08',
      to: '2026-10-08',
      items: [session()],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as never);
    const sheet = workbook.getWorksheet('Schedule');
    expect(sheet?.getCell('A1').value).toBe('Ժամանակացույց');
    expect(sheet?.getCell('A2').value).toBe('08/10/2026 · 1 դաս');
    expect(sheet?.getCell(`A${SCHEDULE_XLSX_HEADER_ROW}`).value).toBe('Ամսաթիվ');
    expect(sheet?.getCell(`E${SCHEDULE_XLSX_HEADER_ROW}`).value).toBe('Դաս');
    expect(sheet?.getCell(`A${SCHEDULE_XLSX_HEADER_ROW + 1}`).value).toBe(
      '08/10/2026',
    );
    expect(sheet?.getCell(`B${SCHEDULE_XLSX_HEADER_ROW + 1}`).value).toBe(
      'Հինգշաբթի',
    );
    expect(sheet?.getCell(`C${SCHEDULE_XLSX_HEADER_ROW + 1}`).value).toBe(
      '10:30',
    );
    expect(sheet?.getCell(`I${SCHEDULE_XLSX_HEADER_ROW + 1}`).value).toBe(5);
    expect(sheet?.getCell(`K${SCHEDULE_XLSX_HEADER_ROW + 1}`).value).toBe(3);
    expect(sheet?.getCell(`L${SCHEDULE_XLSX_HEADER_ROW + 1}`).value).toBe(
      'Ակտիվ',
    );
    expect(sheet?.views[0]).toMatchObject({ state: 'frozen', ySplit: 4 });
  });

  it('names a single-day file after that studio day', () => {
    expect(scheduleExportFilename('2026-10-08', '2026-10-08')).toBe(
      'schedule-2026-10-08.xlsx',
    );
    expect(scheduleExportFilename('2026-10-01', '2026-10-31')).toBe(
      'schedule-2026-10-01_2026-10-31.xlsx',
    );
    expect(scheduleExportFilename()).toBe('schedule.xlsx');
  });

  it('leaves spots as capacity minus booked', () => {
    const cells = scheduleExportSessionCells(
      session({ capacity: 6, booked: 6, status: ClassSessionStatus.FULL }),
      'en',
    );
    expect(cells[10]).toBe(0);
    expect(cells[11]).toBe('Full');
  });
});