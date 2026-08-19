import { buildTokenAndWhere, userContainsToken } from './token-text-search';

describe('buildTokenAndWhere', () => {
  it('returns undefined for empty input', () => {
    expect(buildTokenAndWhere(undefined, userContainsToken)).toBeUndefined();
    expect(buildTokenAndWhere('  ', userContainsToken)).toBeUndefined();
  });

  it('returns a single matcher for one token', () => {
    expect(buildTokenAndWhere('Anna', userContainsToken)).toEqual(
      userContainsToken('Anna'),
    );
  });

  it('requires every token to match', () => {
    expect(buildTokenAndWhere('Anna Lee', userContainsToken)).toEqual({
      AND: [userContainsToken('Anna'), userContainsToken('Lee')],
    });
  });
});
