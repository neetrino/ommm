import {
  buildAuthTokenUrl,
  type AuthTokenUrlParams,
} from './build-auth-token-url';

/** Builds the public invite URL for first-time password setup. */
export function buildCreatePasswordUrl(params: AuthTokenUrlParams): string {
  return buildAuthTokenUrl('create-password', params);
}
