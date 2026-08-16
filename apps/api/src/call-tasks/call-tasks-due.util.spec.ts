import { describe, expect, it } from '@jest/globals';
import { studioWallClockToUtc } from '../common/studio-timezone';
import { callTaskDueFlags, parseCallTaskDueOn } from './call-tasks-due.util';

describe('call-tasks-due.util', () => {
  it('stores dueOn at studio midnight', () => {
    const dueOn = parseCallTaskDueOn('2026-09-15');
    expect(dueOn.toISOString()).toBe(
      studioWallClockToUtc('2026-09-15', '00:00').toISOString(),
    );
  });

  it('marks today vs overdue in studio calendar', () => {
    const todayStart = studioWallClockToUtc('2026-08-16', '12:00');
    const dueToday = parseCallTaskDueOn('2026-08-16');
    const dueYesterday = parseCallTaskDueOn('2026-08-15');
    expect(callTaskDueFlags(dueToday, todayStart)).toEqual({
      dueOnDate: '2026-08-16',
      isOverdue: false,
      isDueToday: true,
    });
    expect(callTaskDueFlags(dueYesterday, todayStart).isOverdue).toBe(true);
  });
});
