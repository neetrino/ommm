import {
  startOfStudioDay,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';

export function parseCallTaskDueOn(dueOnIso: string): Date {
  return studioWallClockToUtc(dueOnIso.trim(), '00:00');
}

export function callTaskDueFlags(
  dueOn: Date,
  now: Date = new Date(),
): { dueOnDate: string; isOverdue: boolean; isDueToday: boolean } {
  const dueOnDate = utcToStudioCalendarDate(dueOn);
  const today = utcToStudioCalendarDate(now);
  return {
    dueOnDate,
    isOverdue: dueOnDate < today,
    isDueToday: dueOnDate === today,
  };
}

export function dueOnFilterCutoff(now: Date = new Date()): Date {
  return startOfStudioDay(now);
}
