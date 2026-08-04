import { buildCreatePasswordUrl } from './build-create-password-url';

describe('buildCreatePasswordUrl', () => {
  it('puts the token in the path, not the query string', () => {
    const url = buildCreatePasswordUrl({
      webAppUrl: 'https://ommm.example/',
      locale: 'en',
      token: 'abc_TOKEN-123',
    });
    expect(url).toBe('https://ommm.example/en/create-password/abc_TOKEN-123');
    expect(url.includes('?')).toBe(false);
  });
});
