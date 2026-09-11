import { ClassSessionStatus } from '@prisma/client';
import {
  COACH_PANEL_SCHEDULE_FUTURE_DAYS,
  COACH_PANEL_SCHEDULE_PAST_DAYS,
  mapCoachPanelSessionRow,
  resolveCoachPanelScheduleRange,
} from './coaches-panel-sessions.helpers';

describe('coach panel schedule range', () => {
  it('opens a past window so coaches can scroll into history', () => {
    const now = new Date('2026-09-11T12:00:00.000Z');
    const { from, to } = resolveCoachPanelScheduleRange(now);
    const spanMs = to.getTime() - from.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const spanDays = spanMs / dayMs;

    expect(from.getTime()).toBeLessThan(now.getTime());
    expect(to.getTime()).toBeGreaterThan(now.getTime());
    expect(spanDays).toBeGreaterThan(
      COACH_PANEL_SCHEDULE_PAST_DAYS + COACH_PANEL_SCHEDULE_FUTURE_DAYS - 2,
    );
    expect(spanDays).toBeLessThan(
      COACH_PANEL_SCHEDULE_PAST_DAYS + COACH_PANEL_SCHEDULE_FUTURE_DAYS + 2,
    );
  });
});

describe('mapCoachPanelSessionRow', () => {
  it('marks a past active session as finished', () => {
    const now = new Date('2026-09-11T12:00:00.000Z');
    const row = mapCoachPanelSessionRow(
      {
        id: 'session-1',
        title: 'Reformer',
        startsAt: new Date('2026-09-10T08:00:00.000Z'),
        endsAt: new Date('2026-09-10T09:00:00.000Z'),
        capacity: 8,
        level: null,
        classFormat: null,
        status: ClassSessionStatus.ACTIVE,
        classType: { id: 'type-1', name: 'Reformer' },
        coach: { id: 'coach-1', user: { name: 'Ana', lastName: 'Coach' } },
        _count: { bookings: 3 },
      },
      now,
    );

    expect(row.status).toBe(ClassSessionStatus.FINISHED);
    expect(row.startsAt).toBe('2026-09-10T08:00:00.000Z');
  });
});
