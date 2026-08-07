export const GOOGLE_PROVIDER = 'google';

export type GoogleOAuthProfile = {
  providerAccountId: string;
  providerEmail: string;
  providerEmailVerified: true;
  name: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  /** Normalized E.164-like phone from Google People API, when available and valid. */
  phone: string | null;
};

export type GoogleAuthCompletion = {
  accessToken: string;
  redirectUrl: string;
};
