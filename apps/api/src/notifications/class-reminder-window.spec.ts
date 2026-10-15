import { classReminderSessionWindow } from './class-reminder-window';

describe('classReminderSessionWindow', () => {
  it('targets [now + h, now + h + 30m) at any hour of the day', () => {
    const atNight = new Date('2026-10-14T23:30:00.000Z');
    const window = classReminderSessionWindow(atNight, 2);
    expect(window.start.toISOString()).toBe('2026-10-15T01:30:00.000Z');
    expect(window.endExclusive.toISOString()).toBe('2026-10-15T02:00:00.000Z');
  });

  it('gives consecutive ticks adjacent, non-overlapping slots', () => {
    const first = classReminderSessionWindow(
      new Date('2026-10-15T07:00:00.000Z'),
      24,
    );
    const second = classReminderSessionWindow(
      new Date('2026-10-15T07:30:00.000Z'),
      24,
    );
    expect(first.endExclusive.getTime()).toBe(second.start.getTime());
  });
});
