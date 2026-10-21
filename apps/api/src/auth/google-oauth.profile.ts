import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { normalizeEmail, parseGoogleName } from './google-oauth.helpers';
import type { GoogleOAuthProfile } from './google-oauth.types';

type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

function audienceMatches(payload: object, clientId: string): boolean {
  const audienceRaw: unknown = Reflect.get(payload, 'aud');
  if (typeof audienceRaw === 'string') {
    return audienceRaw === clientId;
  }
  return (
    Array.isArray(audienceRaw) &&
    audienceRaw.some(
      (item: unknown) => typeof item === 'string' && item === clientId,
    )
  );
}

/** Exchanges the Google code for a verified email profile. */
export async function fetchVerifiedGoogleProfile(
  config: GoogleOAuthConfig,
  code: string,
): Promise<GoogleOAuthProfile> {
  const client = new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.callbackUrl,
  });
  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;
  if (!idToken) {
    throw new UnauthorizedException('Missing Google ID token');
  }
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.clientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !audienceMatches(payload, config.clientId)) {
    throw new UnauthorizedException('Invalid Google ID token');
  }
  const providerAccountId = payload.sub?.trim();
  const providerEmail = payload.email?.trim();
  if (!providerAccountId || !providerEmail || payload.email_verified !== true) {
    throw new UnauthorizedException('Google email is missing or unverified');
  }
  const parsedName = parseGoogleName({
    given_name: payload.given_name,
    family_name: payload.family_name,
    name: payload.name,
  });
  return {
    providerAccountId,
    providerEmail: normalizeEmail(providerEmail),
    providerEmailVerified: true,
    name: parsedName.name,
    lastName: parsedName.lastName,
    avatarUrl: payload.picture?.trim() ?? null,
  };
}
