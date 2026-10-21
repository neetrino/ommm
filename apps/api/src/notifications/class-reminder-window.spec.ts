import {
  classReminderDelayMs,
  classReminderSessionWindow,
} from './class-reminder-window';

const MINUTE_MS = 60 * 1000;

describe('classReminderSessionWindow', () => {
  it('covers the previous tick and this tick around now + h', () => {
    const atNight = new Date('2026-10-14T23:30:00.000Z');
    const window = classReminderSessionWindow(atNight, 2);
    expect(window.start.toISOString()).toBe('2026-10-15T01:00:00.000Z');
    expect(window.endExclusive.toISOString()).toBe('2026-10-15T02:00:00.000Z');
  });

  it('keeps the same slot when the tick starts a few seconds late', () => {
    const onTime = classReminderSessionWindow(
      new Date('2026-10-15T07:00:00.000Z'),
      2,
    );
    const late = classReminderSessionWindow(
      new Date('2026-10-15T07:00:20.000Z'),
      2,
    );
    expect(late.start.toISOString()).toBe(onTime.start.toISOString());
    expect(late.endExclusive.toISOString()).toBe(
      onTime.endExclusive.toISOString(),
    );
  });

  it('overlaps the next tick only on the catch-up half', () => {
    const first = classReminderSessionWindow(
      new Date('2026-10-15T07:00:00.000Z'),
      24,
    );
    const second = classReminderSessionWindow(
      new Date('2026-10-15T07:30:00.000Z'),
      24,
    );
    expect(second.start.getTime() - first.start.getTime()).toBe(30 * MINUTE_MS);
    expect(second.start.getTime()).toBeLessThan(first.endExclusive.getTime());
    expect(first.endExclusive.getTime()).toBe(
      second.start.getTime() + 30 * MINUTE_MS,
    );
  });
});

describe('classReminderDelayMs', () => {
  it('waits out the minutes past the half-hour instead of sending early', () => {
    const startsAt = new Date('2026-10-15T10:29:00.000Z');
    const tick = new Date('2026-10-15T08:00:00.000Z');
    expect(classReminderDelayMs(tick, startsAt, 2)).toBe(29 * MINUTE_MS);
  });

  it('is zero at the exact offset and after it', () => {
    const startsAt = new Date('2026-10-15T10:29:00.000Z');
    expect(
      classReminderDelayMs(new Date('2026-10-15T08:29:00.000Z'), startsAt, 2),
    ).toBe(0);
    expect(
      classReminderDelayMs(new Date('2026-10-15T08:40:00.000Z'), startsAt, 2),
    ).toBe(0);
  });
});
