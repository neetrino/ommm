import {
  endOfStudioDayInclusive,
  studioWallClockToUtc,
} from '../common/studio-timezone';
import { buildSessionStartsAtFilter } from './bookings-management.helpers';

describe('buildSessionStartsAtFilter', () => {
  it('clamps a lone from date to that studio calendar day', () => {
    expect(buildSessionStartsAtFilter('2026-08-19')).toEqual({
      gte: studioWallClockToUtc('2026-08-19', '00:00'),
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-19', '12:00')),
    });
  });

  it('keeps an open start when only to is set', () => {
    expect(buildSessionStartsAtFilter(undefined, '2026-08-21')).toEqual({
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-21', '12:00')),
    });
  });

  it('uses inclusive studio-day bounds for a from/to range', () => {
    expect(buildSessionStartsAtFilter('2026-08-19', '2026-08-21')).toEqual({
      gte: studioWallClockToUtc('2026-08-19', '00:00'),
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-21', '12:00')),
    });
  });

  it('returns undefined when both dates are empty', () => {
    expect(buildSessionStartsAtFilter()).toBeUndefined();
    expect(buildSessionStartsAtFilter('', '')).toBeUndefined();
  });
});
