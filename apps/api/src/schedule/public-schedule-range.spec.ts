import { resolvePublicScheduleRange } from './public-schedule-range';

describe('resolvePublicScheduleRange', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-08T15:30:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults to today start through 30 days end', () => {
    const range = resolvePublicScheduleRange();
    expect(range.from).toEqual(new Date('2026-06-08T00:00:00'));
    expect(range.to).toEqual(new Date('2026-07-08T23:59:59.999'));
  });

  it('clamps client bounds to the maximum public window', () => {
    const range = resolvePublicScheduleRange(
      '2026-06-01T00:00:00.000Z',
      '2026-12-31T23:59:59.999Z',
    );
    expect(range.from).toEqual(new Date('2026-06-08T00:00:00'));
    expect(range.to).toEqual(new Date('2026-07-08T23:59:59.999'));
  });
});
