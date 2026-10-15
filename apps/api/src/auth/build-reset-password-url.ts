import {
  buildAuthTokenUrl,
  type AuthTokenUrlParams,
} from './build-auth-token-url';

/** Builds the public "forgot password" link for members who already have a password. */
export function buildResetPasswordUrl(params: AuthTokenUrlParams): string {
  return buildAuthTokenUrl('reset-password', params);
}
