import {
  addStudioCalendarDays,
  endOfStudioDayInclusive,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';
import { resolvePublicScheduleRange } from './public-schedule-range';

describe('resolvePublicScheduleRange', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-08T15:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults to today start through 30 days end in studio timezone', () => {
    const range = resolvePublicScheduleRange();
    expect(range.from).toEqual(studioWallClockToUtc('2026-06-08', '00:00'));
    expect(range.to).toEqual(
      endOfStudioDayInclusive(studioWallClockToUtc('2026-07-08', '12:00')),
    );
  });

  it('clamps client bounds to the maximum public window', () => {
    const range = resolvePublicScheduleRange(
      '2026-06-01T00:00:00.000Z',
      '2026-12-31T23:59:59.999Z',
    );
    expect(range.from).toEqual(studioWallClockToUtc('2026-06-08', '00:00'));
    expect(range.to).toEqual(
      endOfStudioDayInclusive(studioWallClockToUtc('2026-07-08', '12:00')),
    );
  });

  it('extends the window by studio calendar days', () => {
    const today = utcToStudioCalendarDate(new Date('2026-06-08T15:30:00.000Z'));
    expect(addStudioCalendarDays(today, 30)).toBe('2026-07-08');
  });
});
