import {
  utcToStudioCalendarDate,
  utcToStudioWallClockTime,
} from '../common/studio-timezone';
import { coachSalarySessionStatusLabel } from './coaches-salary-export-labels';
import type { CoachSalarySessionRow } from './coaches-salary-sessions.helpers';

export type CoachSalaryExportCell = string | number | null;

const EXPORT_COLUMN_COUNT = 7;

export function formatCoachExportName(user: {
  name: string | null;
  lastName: string | null;
}): string {
  const parts = [user.name, user.lastName]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts.join(' ') : 'Coach';
}

export function formatCoachSalaryExportDay(isoDay: string): string {
  const [year, month, day] = isoDay.split('-');
  if (!year || !month || !day) {
    return isoDay;
  }
  return `${day}/${month}/${year}`;
}

export function coachSalaryExportFilename(
  coachName: string,
  from: string,
  to: string,
): string {
  const safeName = coachName.replace(/[\\/:*?"<>|\r\n]/g, '').trim() || 'Coach';
  return `${safeName.slice(0, 60)} ${from} ${to}.xlsx`;
}

export function coachSalaryExportContentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/** One worksheet row matching the finance salary table, with numeric AMD amounts. */
export function coachSalaryExportSessionCells(
  row: CoachSalarySessionRow,
): CoachSalaryExportCell[] {
  const cells: CoachSalaryExportCell[] = [
    row.classType.name,
    formatStudioExportDate(row.startsAt),
    utcToStudioWallClockTime(row.startsAt),
    attendanceCell(row),
    row.rateAmd > 0 ? row.rateAmd : null,
    row.reason === 'PAID' ? row.amountAmd : null,
    coachSalarySessionStatusLabel(row.reason),
  ];
  return cells.slice(0, EXPORT_COLUMN_COUNT);
}

function formatStudioExportDate(value: Date): string {
  return formatCoachSalaryExportDay(utcToStudioCalendarDate(value));
}

function attendanceCell(row: CoachSalarySessionRow): string | null {
  if (!Number.isFinite(row.capacity) || row.capacity <= 0) {
    return null;
  }
  return `${row.attendedCount}/${row.capacity}`;
}
