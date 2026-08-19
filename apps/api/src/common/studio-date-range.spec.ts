import {
  endOfStudioDayInclusive,
  studioWallClockToUtc,
} from './studio-timezone';
import {
  buildOpenEndedStudioDateTimeFilter,
  buildStudioDateTimeFilter,
} from './studio-date-range';

describe('buildStudioDateTimeFilter', () => {
  it('clamps a lone from date to that studio calendar day', () => {
    expect(buildStudioDateTimeFilter('2026-08-19')).toEqual({
      gte: studioWallClockToUtc('2026-08-19', '00:00'),
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-19', '12:00')),
    });
  });

  it('keeps an open start when only to is set', () => {
    expect(buildStudioDateTimeFilter(undefined, '2026-08-21')).toEqual({
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-21', '12:00')),
    });
  });

  it('uses inclusive studio-day bounds for a from/to range', () => {
    expect(buildStudioDateTimeFilter('2026-08-19', '2026-08-21')).toEqual({
      gte: studioWallClockToUtc('2026-08-19', '00:00'),
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-21', '12:00')),
    });
  });
});

describe('buildOpenEndedStudioDateTimeFilter', () => {
  it('keeps a lone from date open through latest', () => {
    expect(buildOpenEndedStudioDateTimeFilter('2026-08-19')).toEqual({
      gte: studioWallClockToUtc('2026-08-19', '00:00'),
    });
  });

  it('keeps an open start when only to is set', () => {
    expect(buildOpenEndedStudioDateTimeFilter(undefined, '2026-08-21')).toEqual({
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-21', '12:00')),
    });
  });

  it('uses inclusive studio-day bounds for a from/to range', () => {
    expect(buildOpenEndedStudioDateTimeFilter('2026-08-19', '2026-08-21')).toEqual({
      gte: studioWallClockToUtc('2026-08-19', '00:00'),
      lte: endOfStudioDayInclusive(studioWallClockToUtc('2026-08-21', '12:00')),
    });
  });

  it('returns undefined when both dates are empty', () => {
    expect(buildOpenEndedStudioDateTimeFilter()).toBeUndefined();
    expect(buildOpenEndedStudioDateTimeFilter('', '')).toBeUndefined();
  });
});
