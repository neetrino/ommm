import { buildResetPasswordUrl } from './build-reset-password-url';

describe('buildResetPasswordUrl', () => {
  it('puts the token in the path, not the query string', () => {
    const url = buildResetPasswordUrl({
      webAppUrl: 'https://ommm.example/',
      locale: 'hy',
      token: 'abc_TOKEN-123',
    });
    expect(url).toBe('https://ommm.example/hy/reset-password/abc_TOKEN-123');
    expect(url.includes('?')).toBe(false);
  });

  it('falls back to the default locale when none is set', () => {
    const url = buildResetPasswordUrl({
      webAppUrl: 'https://ommm.example',
      locale: ' ',
      token: 'tok',
    });
    expect(url).toBe('https://ommm.example/en/reset-password/tok');
  });
});
