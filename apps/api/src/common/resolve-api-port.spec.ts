import { API_DEFAULT_PORT, resolveApiPort } from './resolve-api-port';

describe('resolveApiPort', () => {
  it('prefers API_PORT over PORT', () => {
    expect(resolveApiPort({ API_PORT: '4100', PORT: '3000' })).toBe(4100);
  });

  it('falls back to PORT when API_PORT is unset', () => {
    expect(resolveApiPort({ PORT: '4500' })).toBe(4500);
  });

  it('defaults to 4000 when unset or invalid', () => {
    expect(resolveApiPort({})).toBe(API_DEFAULT_PORT);
    expect(resolveApiPort({ API_PORT: 'abc' })).toBe(API_DEFAULT_PORT);
    expect(resolveApiPort({ API_PORT: '0' })).toBe(API_DEFAULT_PORT);
  });
});
